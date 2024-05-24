import { getChainName } from '$shared/dynamicConfig';
import {
  CHAIN,
  ConnectItem,
  ConnectItemReply,
  ConnectRequest,
  TonProofItemReply,
} from '@tonconnect/protocol';
import naclUtils from 'tweetnacl-util';
import nacl from 'tweetnacl';
import TonWeb from 'tonweb';
import { Buffer } from 'buffer';
import { getDomainFromURL } from '$utils';
import { Int64LE } from 'int64-buffer';
import { DAppManifest } from './models';
import { getRawTimeFromLiteserverSafely } from '@tonkeeper/shared/utils/blockchain';

const { createHash } = require('react-native-crypto');

export class ConnectReplyBuilder {
  request: ConnectRequest;

  manifest: DAppManifest;

  constructor(request: ConnectRequest, manifest: DAppManifest) {
    this.request = request;
    this.manifest = manifest;
  }

  private async createTonProofItem(
    address: string,
    secretKey: Uint8Array,
    payload: string,
  ): Promise<TonProofItemReply> {
    try {
      const timestamp = await getRawTimeFromLiteserverSafely();
      const timestampBuffer = new Int64LE(timestamp).toBuffer();

      const domain = getDomainFromURL(this.manifest.url);
      const domainBuffer = Buffer.from(domain);
      const domainLengthBuffer = Buffer.allocUnsafe(4);
      domainLengthBuffer.writeInt32LE(domainBuffer.byteLength);

      const [workchain, addrHash] = address.split(':');

      const addressWorkchainBuffer = Buffer.allocUnsafe(4);
      addressWorkchainBuffer.writeInt32BE(Number(workchain));

      const addressBuffer = Buffer.concat([
        addressWorkchainBuffer,
        Buffer.from(addrHash, 'hex'),
      ]);

      const messageBuffer = Buffer.concat([
        Buffer.from('ton-proof-item-v2/'),
        addressBuffer,
        domainLengthBuffer,
        domainBuffer,
        timestampBuffer,
        Buffer.from(payload),
      ]);

      const message = createHash('sha256').update(messageBuffer).digest();

      const bufferToSign = Buffer.concat([
        Buffer.from('ffff', 'hex'),
        Buffer.from('ton-connect'),
        message,
      ]);

      const signed = nacl.sign.detached(
        createHash('sha256').update(bufferToSign).digest(),
        secretKey,
      );

      const signature = naclUtils.encodeBase64(signed);

      return {
        name: 'ton_proof',
        proof: {
          timestamp,
          domain: {
            lengthBytes: domainBuffer.byteLength,
            value: domain,
          },
          signature,
          payload,
        },
      };
    } catch (e) {
      return {
        name: 'ton_proof',
        error: {
          code: 0,
          message: `Wallet internal error: ${e.message}`,
        },
      };
    }
  }

  async createReplyItems(
    addr: string,
    privateKey: Uint8Array,
    publicKey: Uint8Array,
    walletStateInit: string,
    isTestnet: boolean,
  ): Promise<ConnectItemReply[]> {
    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    const replyItems: ConnectItemReply[] = [];
    for (const item of this.request.items) {
      switch (item.name) {
        case 'ton_addr':
          replyItems.push({
            name: 'ton_addr',
            address,
            network: isTestnet ? CHAIN.TESTNET : CHAIN.MAINNET,
            publicKey: Buffer.from(publicKey).toString('hex'),
            walletStateInit,
          });
          break;

        case 'ton_proof':
          replyItems.push(
            await this.createTonProofItem(address, privateKey, item.payload),
          );
          break;

        default:
          replyItems.push({
            name: (item as ConnectItem).name,
            error: { code: 400 },
          } as unknown as ConnectItemReply);
      }
    }

    return replyItems;
  }

  static createAutoConnectReplyItems(
    addr: string,
    publicKey: Uint8Array,
    walletStateInit: string,
  ): ConnectItemReply[] {
    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    return [
      {
        name: 'ton_addr',
        address,
        network: getChainName() === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET,
        publicKey: Buffer.from(publicKey).toString('hex'),
        walletStateInit,
      },
    ];
  }
}
