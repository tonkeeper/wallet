import { getTimeSec } from '$utils/getTimeSec';
import { Int64LE } from 'int64-buffer';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import naclUtils from 'tweetnacl-util';
const { createHash } = require('react-native-crypto');
import { ConnectApi, Configuration } from '@tonkeeper/core';
import { getServerConfigSafe } from '$shared/constants';
import { Address } from '$libs/Ton';

export async function createTonProofForTonkeeper(
  addressRaw: string,
  secretKey: Uint8Array,
) {
  try {
    const address = new Address(addressRaw).toString(false);
    const connectApi = new ConnectApi(
      new Configuration({
        basePath: getServerConfigSafe('tonapiV2Endpoint'),
        headers: {
          Authorization: `Bearer ${getServerConfigSafe('tonApiV2Key')}`,
        },
      }),
    );
    const { payload } = await connectApi.getTonConnectPayload();
    const timestamp = getTimeSec();
    const timestampBuffer = new Int64LE(timestamp).toBuffer();

    const domain = 'tonkeeper.com';
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
      },
    };
  } catch (e) {
    return {
      error: {
        code: 0,
        message: `Wallet internal error: ${e.message}`,
      },
    };
  }
}
