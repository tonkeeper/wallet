import { Int64LE } from 'int64-buffer';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import naclUtils from 'tweetnacl-util';
const { createHash } = require('react-native-crypto');
import { ConnectApi, Configuration } from '@tonkeeper/core/src/legacy';
import { Address } from '@tonkeeper/core';
import { config } from '$config';
import { getRawTimeFromLiteserverSafely } from '@tonkeeper/shared/utils/blockchain';

export interface TonProofArgs {
  address: string;
  secretKey: Uint8Array;
  walletStateInit: string;
  domain: string;
  payload?: string;
}

export async function createTonProof({
  address: _addr,
  payload: _payload,
  secretKey,
  walletStateInit,
  domain,
}: TonProofArgs) {
  try {
    const address = Address.parse(_addr).toRaw();
    const connectApi = new ConnectApi(
      new Configuration({
        basePath: config.get('tonapiV2Endpoint'),
        headers: {
          Authorization: `Bearer ${config.get('tonApiV2Key')}`,
        },
      }),
    );
    let payload = _payload;
    if (!payload) {
      payload = (await connectApi.getTonConnectPayload()).payload;
    }
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
          lengthBytes: domainBuffer.byteLength,
          value: domain,
        },
        signature,
        payload,
        stateInit: walletStateInit,
      },
    };
  } catch (e) {
    throw new Error('Failed to create proof');
  }
}

export async function createTonProofForTonkeeper(
  addressRaw: string,
  secretKey: Uint8Array,
  walletStateInit: string,
) {
  return createTonProof({
    address: addressRaw,
    secretKey,
    walletStateInit,
    domain: 'tonkeeper.com',
  });
}
