import '@ethersproject/shims';
import { ethers, AbiCoder, sha256, encodeBase58, decodeBase58 } from 'ethers';
import { Mnemonic } from './mnemonic';
import { CryptoUtils } from './cryptoUtils';

export const ADDRESS_PREFIX_REGEX = /^(41)/;

export const TronAddress = {
  hexToBase58(address: string): string {
    const tronAddressPayload = '0x41' + address.slice(2);
    const checkSumTail = sha256(sha256(tronAddressPayload)).slice(2, 10);
    return encodeBase58(tronAddressPayload + checkSumTail);
  },
  base58Tohex(address: string): string {
    const decoded = decodeBase58(address).toString(16);
    return decoded.slice(0, -8);
  },
};

export function keccak256(value: string) {
  if (!value.startsWith('0x')) {
    return ethers.keccak256(ethers.toUtf8Bytes(value));
  }
  return ethers.keccak256(value);
}

export function encodeTronParams(types: string[], values: unknown[]) {
  for (let i = 0; i < types.length; i++) {
    if (types[i] === 'address') {
      values[i] = TronAddress.base58Tohex(values[i] as string).replace(
        ADDRESS_PREFIX_REGEX,
        '0x',
      );
    }
  }

  return new AbiCoder().encode(types, values);
}

export function encodePackedBytes(values: string[]) {
  return '0x' + values.map((x) => x.replace('0x', '')).join('');
}

export const tonPKToTronPK = async (tonPrivateKey: Uint8Array): Promise<string> => {
  // TON-compatible seed
  const seed = tonPrivateKey.slice(0, 32);

  // Sub-protocol derivation for ETH-derived keys:
  // Note that tonweb's definition of hmacSha512 takes in hex-encoded strings
  const tronSeed = await CryptoUtils.hmac_sha512(seed, 'BIP32');

  // Plug into BIP39 with TRON path m/44'/195'/0'/0/0:
  const TRON_BIP39_PATH_INDEX_0 = "m/44'/195'/0'/0/0";
  const account = ethers.HDNodeWallet.fromSeed(tronSeed).derivePath(
    TRON_BIP39_PATH_INDEX_0,
  );
  return account.privateKey.slice(2); // note: this is hex-encoded, remove 0x
};

export const createTronOwnerAddress = async (tonPrivateKey: Uint8Array): Promise<string> => {
  const wallet = new ethers.Wallet(await tonPKToTronPK(tonPrivateKey));
  return TronAddress.hexToBase58(wallet.address);
};

export const seeIfValidTronAddress = (address: string): boolean => {
  try {
      const decoded = decodeBase58(address).toString(16);
      if (decoded.length !== 50 || !decoded.startsWith('41')) {
          return false;
      }
      const payload = decoded.slice(0, 42);
      const tail = decoded.slice(42);
      const checkSumTail = sha256(sha256('0x' + payload)).slice(2, 10);
      return tail === checkSumTail;
  } catch (e) {
      return false;
  }
};


//
//
//

const DomainAbi = ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address', 'bytes32'];
const RequestAbi = [
    'bytes32',
    'address',
    'address',
    'uint256',
    'uint256',
    'uint32',
    'tuple(address,uint256,bytes)[]'
];

export function hashRequest(request: any, contractAddress: string, chainId: string) {
  const REQUEST_TYPEHASH = keccak256(
      'Request(address feeReceiver,address feeToken,uint256 fee,uint256 deadline,uint32 nonce,Message[] messages)'
  );
  const structHash = keccak256(
      encodeTronParams(RequestAbi, [
          REQUEST_TYPEHASH,
          request.feeReceiver,
          request.feeToken,
          request.fee,
          request.deadline,
          request.nonce,
          request.messages.map(m => [
              '0x' + TronAddress.base58Tohex(m.to).slice(2),
              m.value,
              m.data
          ])
      ])
  );

  const domain = domainHash(contractAddress, chainId);

  return keccak256(encodePackedBytes(['0x1901', domain, structHash]));
}


function domainHash(contractAddress: string, chainId: string) {
  const TIP712_DOMAIN_TYPEHASH = keccak256(
      'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)'
  );
  const NAME = keccak256('TONKEEPER');
  const VERSION = keccak256('1');
  const SALT = keccak256('TRON_WALLET');
  return keccak256(
      encodeTronParams(DomainAbi, [
          TIP712_DOMAIN_TYPEHASH,
          NAME,
          VERSION,
          chainId,
          contractAddress,
          SALT
      ])
  );
}
