import { getChainName } from '$shared/dynamicConfig';
import {
  CHAIN,
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

const { createHash } = require('react-native-crypto');

export class ConnectReplyBuilder {
  request: ConnectRequest;

  constructor(request: ConnectRequest) {
    this.request = request;
  }

  private getNetwork() {
    return getChainName() === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET;
  }

  private createTonProofItem(
    address: string,
    secretKey: Uint8Array,
    payload: string,
  ): TonProofItemReply {
    const timestamp = getTimeSec();
    const timestampBuffer = new Int64LE(timestamp).toBuffer();

    const domain = getDomainFromURL(this.request.url);
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
  }

  createReplyItems(addr: string, privateKey: Uint8Array): ConnectItemReply[] {
    const replyItems: ConnectItemReply[] = [];

    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    this.request.items.forEach((requestItem) => {
      if (requestItem.name === 'ton_addr') {
        replyItems.push({
          name: 'ton_addr',
          address,
          network: this.getNetwork(),
        });
      }

      if (requestItem.name === 'ton_proof') {
        replyItems.push(
          this.createTonProofItem(address, privateKey, requestItem.payload),
        );
      }
    });

    return replyItems;
  }

  createAutoConnectReplyItems(addr: string): ConnectItemReply[] {
    const address = new TonWeb.utils.Address(addr).toString(false, true, true);

    return [
      {
        name: 'ton_addr',
        address,
        network: this.getNetwork(),
      },
    ];
  }
}
