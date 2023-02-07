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
import { getTimeSec } from '$utils/getTimeSec';
import { Int64LE } from 'int64-buffer';
import { CONNECT_ITEM_ERROR_CODES } from '@tonconnect/protocol/lib/models/wallet-message/wallet-event/connect-event';
import { DAppManifest } from './models';

const { createHash } = require('react-native-crypto');

export class ConnectReplyBuilder {
  request: ConnectRequest;

  manifest: DAppManifest;

  constructor(request: ConnectRequest, manifest: DAppManifest) {
    this.request = request;
    this.manifest = manifest;
  }

  private static getNetwork() {
    return getChainName() === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET;
  }

  private createTonProofItem(
    address: string,
    secretKey: Uint8Array,
    payload: string,
  ): TonProofItemReply {
    try {
      const timestamp = getTimeSec();
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
          code: CONNECT_ITEM_ERROR_CODES.UNKNOWN_ERROR,
          message: `Wallet internal error: ${e.message}`,
        },
      };
    }
  }

  createReplyItems(addr: string, privateKey: Uint8Array, walletStateInit: string): ConnectItemReply[] {
    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    const replyItems = this.request.items.map((requestItem): ConnectItemReply => {
      switch (requestItem.name) {
        case 'ton_addr':
          return {
            name: 'ton_addr',
            address,
            network: ConnectReplyBuilder.getNetwork(),
            walletStateInit,
          };

        case 'ton_proof':
          return this.createTonProofItem(address, privateKey, requestItem.payload);

        default:
          return {
            name: (requestItem as ConnectItem).name,
            error: { code: CONNECT_ITEM_ERROR_CODES.METHOD_NOT_SUPPORTED },
          } as unknown as ConnectItemReply;
      }
    });

    return replyItems;
  }

  static createAutoConnectReplyItems(addr: string, walletStateInit: string): ConnectItemReply[] {
    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    return [
      {
        name: 'ton_addr',
        address,
        network: ConnectReplyBuilder.getNetwork(),
        walletStateInit,
      },
    ];
  }
}
