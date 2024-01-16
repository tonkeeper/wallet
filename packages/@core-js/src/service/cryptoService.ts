/**
 * Service methods to decrypt and encrypt values
 * Original code: https://github.com/toncenter/ton-wallet/blob/82d8a66736d25e5a37b45654b17caf9755252792/src/js/Controller.js#L68
 *
 * @author: KuznetsovNikita
 * @since: 0.0.1
 */

import { Sha256 } from '@aws-crypto/sha256-js';
import { Address, Cell, beginCell } from '@ton/core';
import * as ed25519 from '@noble/ed25519';
import aesjs from 'aes-js';
import crypto from 'isomorphic-webcrypto';

export const sha256 = (value: Buffer) => {
  const sha = new Sha256();
  sha.update(value);
  return Buffer.from(sha.digestSync());
};

export async function encrypt(plaintext: string, password: string) {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv

  const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
  const ctBase64 = btoa(ctStr); // encode ciphertext as base64

  const ivHex = Array.from(iv)
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join(''); // iv as hex string

  return ivHex + ctBase64; // return iv+ciphertext
}

export async function decrypt(ciphertext: string, password: string) {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const iv = ciphertext
    .slice(0, 24)
    .match(/.{2}/g)!
    .map((byte) => parseInt(byte, 16)); // get iv from ciphertext

  const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) }; // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']); // use pw to generate key

  const ctStr = atob(ciphertext.slice(24)); // decode base64 ciphertext
  const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g)!.map((ch) => ch.charCodeAt(0))); // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
  const plaintext = new TextDecoder().decode(plainBuffer); // decode password from UTF-8

  return plaintext; // return the plaintext
}

const hmac_sha512 = async (key: Uint8Array, data: Uint8Array): Promise<Uint8Array> => {
  const hmacAlgo = { name: 'HMAC', hash: { name: 'SHA-512' } };
  const hmacKey = await crypto.subtle.importKey('raw', key, hmacAlgo, false, ['sign']);
  const signature = await crypto.subtle.sign(hmacAlgo, hmacKey, data);
  const result = new Uint8Array(signature);
  if (result.length !== 512 / 8) throw new Error();
  return result;
};

const getAesCbcState = async (hash: Uint8Array) => {
  if (hash.length < 48) throw new Error();
  const key = hash.slice(0, 32);
  const iv = hash.slice(32, 32 + 16);

  // Note that native crypto.subtle AES-CBC not suitable here because
  // even if the data IS a multiple of 16 bytes, padding will still be added
  // So we use aes-js

  return new aesjs.ModeOfOperation.cbc(key, iv);
};

const getRandomPrefix = (dataLength: number, minPadding: number) => {
  const prefixLength = ((minPadding + 15 + dataLength) & -16) - dataLength;
  const prefix = crypto.getRandomValues(new Uint8Array(prefixLength));
  prefix[0] = prefixLength;
  if ((prefixLength + dataLength) % 16 !== 0) throw new Error();
  return prefix;
};

const combineSecrets = async (a: Uint8Array, b: Uint8Array): Promise<Uint8Array> => {
  return hmac_sha512(a, b);
};

const encryptDataWithPrefix = async (
  data: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
) => {
  if (data.length % 16 !== 0) throw new Error();
  const dataHash = await combineSecrets(salt, data);
  const msgKey = dataHash.slice(0, 16);

  const res = new Uint8Array(data.length + 16);
  res.set(msgKey, 0);

  const cbcStateSecret = await combineSecrets(sharedSecret, msgKey);
  const encrypted = (await getAesCbcState(cbcStateSecret)).encrypt(data);
  res.set(encrypted, 16);

  return res;
};

const encryptDataImpl = async (
  data: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  const prefix = await getRandomPrefix(data.length, 16);
  const combined = new Uint8Array(prefix.length + data.length);
  combined.set(prefix, 0);
  combined.set(data, prefix.length);
  return encryptDataWithPrefix(combined, sharedSecret, salt);
};

const encryptData = async (
  data: Uint8Array,
  myPublicKey: Uint8Array,
  theirPublicKey: Uint8Array,
  privateKey: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  const sharedSecret = await ed25519.getSharedSecret(privateKey, theirPublicKey);

  const encrypted = await encryptDataImpl(data, sharedSecret, salt);
  const prefixedEncrypted = new Uint8Array(myPublicKey.length + encrypted.length);
  for (let i = 0; i < myPublicKey.length; i++) {
    prefixedEncrypted[i] = theirPublicKey[i] ^ myPublicKey[i];
  }
  prefixedEncrypted.set(encrypted, myPublicKey.length);

  return prefixedEncrypted;
};

const storeDeepRef = (bytes: Uint8Array): Cell => {
  const CELL_BYTE_LENGTH = 127;
  if (bytes.length <= CELL_BYTE_LENGTH) {
    return beginCell()
      .storeBuffer(Buffer.from(bytes.slice(0, CELL_BYTE_LENGTH)))
      .endCell();
  } else {
    return beginCell()
      .storeBuffer(Buffer.from(bytes.slice(0, Math.min(bytes.length, CELL_BYTE_LENGTH))))
      .storeRef(storeDeepRef(Buffer.from(bytes.slice(CELL_BYTE_LENGTH, bytes.length))))
      .endCell();
  }
};

const makeSnakeCells = (bytes: Uint8Array): Cell => {
  const ROOT_CELL_BYTE_LENGTH = 35 + 4;
  const CELL_BYTE_LENGTH = 127;
  const rootCellBuilder = beginCell().storeBuffer(
    Buffer.from(bytes.slice(0, Math.min(bytes.length, ROOT_CELL_BYTE_LENGTH))),
  );

  const cellCount = Math.ceil((bytes.length - ROOT_CELL_BYTE_LENGTH) / CELL_BYTE_LENGTH);
  if (cellCount > 16) {
    throw new Error('Text too long');
  }

  rootCellBuilder.storeRef(
    storeDeepRef(Buffer.from(bytes.slice(ROOT_CELL_BYTE_LENGTH, bytes.length))),
  );

  return rootCellBuilder.endCell();
};

export const encryptMessageComment = async (
  comment: string,
  myPublicKey: Uint8Array,
  theirPublicKey: Uint8Array,
  myPrivateKey: Uint8Array,
  senderAddress: string | Address,
): Promise<Cell> => {
  if (!comment || !comment.length) throw new Error('empty comment');

  if (myPrivateKey.length === 64) {
    myPrivateKey = myPrivateKey.slice(0, 32); // convert nacl private key
  }

  const commentBytes = new TextEncoder().encode(comment);

  const address =
    senderAddress instanceof Address ? senderAddress : Address.parse(senderAddress);

  const salt = new TextEncoder().encode(
    address.toString({ bounceable: true, urlSafe: true, testOnly: false }),
  );

  const encryptedBytes = await encryptData(
    commentBytes,
    myPublicKey,
    theirPublicKey,
    myPrivateKey,
    salt,
  );

  const payload = new Uint8Array(encryptedBytes.length + 4);
  payload[0] = 0x21; // encrypted text prefix
  payload[1] = 0x67;
  payload[2] = 0xda;
  payload[3] = 0x4b;
  payload.set(encryptedBytes, 4);

  return makeSnakeCells(payload);
};

const doDecrypt = async (
  cbcStateSecret: Uint8Array,
  msgKey: Uint8Array,
  encryptedData: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  const decryptedData = (await getAesCbcState(cbcStateSecret)).decrypt(encryptedData);
  const dataHash = await combineSecrets(salt, decryptedData);
  const gotMsgKey = dataHash.slice(0, 16);
  if (msgKey.join(',') !== gotMsgKey.join(',')) {
    throw new Error('Failed to decrypt: hash mismatch');
  }
  const prefixLength = decryptedData[0];
  if (prefixLength > decryptedData.length || prefixLength < 16) {
    throw new Error('Failed to decrypt: invalid prefix size');
  }

  return decryptedData.slice(prefixLength);
};

const decryptDataImpl = async (
  encryptedData: Uint8Array,
  sharedSecret: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  if (encryptedData.length < 16) throw new Error('Failed to decrypt: data is too small');
  if (encryptedData.length % 16 !== 0)
    throw new Error('Failed to decrypt: data size is not divisible by 16');
  const msgKey = encryptedData.slice(0, 16);
  const data = encryptedData.slice(16);
  const cbcStateSecret = await combineSecrets(sharedSecret, msgKey);
  const res = await doDecrypt(cbcStateSecret, msgKey, data, salt);

  return res;
};

export const decryptData = async (
  data: Uint8Array,
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  if (data.length < publicKey.length) {
    throw new Error('Failed to decrypt: data is too small');
  }
  const theirPublicKey = new Uint8Array(publicKey.length);
  for (let i = 0; i < publicKey.length; i++) {
    theirPublicKey[i] = data[i] ^ publicKey[i];
  }
  const sharedSecret = await ed25519.getSharedSecret(privateKey, theirPublicKey);

  const decrypted = await decryptDataImpl(
    data.slice(publicKey.length),
    sharedSecret,
    salt,
  );

  return decrypted;
};

export const decryptMessageComment = async (
  encryptedData: Uint8Array,
  myPublicKey: Uint8Array,
  myPrivateKey: Uint8Array,
  senderAddress: string | Address,
): Promise<string> => {
  if (myPrivateKey.length === 64) {
    myPrivateKey = myPrivateKey.slice(0, 32); // convert nacl private key
  }
  const address =
    senderAddress instanceof Address ? senderAddress : Address.parse(senderAddress);

  const salt = new TextEncoder().encode(
    address.toString({ bounceable: true, urlSafe: true }),
  );

  const decryptedBytes = await decryptData(
    encryptedData,
    myPublicKey,
    myPrivateKey,
    salt,
  );

  return new TextDecoder().decode(decryptedBytes);
};
