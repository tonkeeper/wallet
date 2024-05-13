import { Int64LE } from 'int64-buffer';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import naclUtils from 'tweetnacl-util';
const { createHash } = require('react-native-crypto');
import { Address } from '../formatters/Address';
import { getRawTimeFromLiteserverSafely } from '@tonkeeper/shared/utils/blockchain';

export interface TonProofArgs {
  address: string;
  secretKey: Uint8Array;
  walletStateInit: string;
  domain: string;
  payload: string;
}

export async function createTonProof({
  address: _addr,
  payload,
  secretKey,
  walletStateInit,
  domain,
}: TonProofArgs) {
  try {
    const address = Address.parse(_addr).toRaw();
    const timestamp = await getRawTimeFromLiteserverSafely();
    const timestampBuffer = new Int64LE(timestamp).toBuffer();

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
      address,
      proof: {
        timestamp,
        domain: {
          length_bytes: domainBuffer.byteLength,
          value: domain,
        },
        signature,
        payload,
        state_init: walletStateInit,
      },
    };
  } catch (e) {
    throw new Error('Failed to create proof');
  }
}

export async function signProofForTonkeeper(
  addressRaw: string,
  secretKey: Uint8Array,
  payload: string,
  walletStateInit: string,
) {
  return createTonProof({
    address: addressRaw,
    secretKey,
    payload,
    walletStateInit,
    domain: 'tonkeeper.com',
  });
}
