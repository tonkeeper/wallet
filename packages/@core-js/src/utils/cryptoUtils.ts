// TODO: convert to module for inject mobile or web crypto functions
import { NativeModules } from 'react-native';
const createHmac = require('create-hmac');
const { TonPbkdf2 } = NativeModules;

async function hmac_sha512(phrase: Uint8Array, password: string) {
  const passwordBuffer = password.length
    ? stringToUint8Array(password)
    : new Uint8Array(new ArrayBuffer(0));
  return createHmac('sha512', phrase).update(passwordBuffer).digest();
}

async function pbkdf2_sha512(key: ArrayBuffer, salt: string, iterations: number) {
  const hexkey = bufferToHex(key);
  const hexresult = await TonPbkdf2.derivationKey(hexkey, salt, iterations);
  return new Uint8Array(Buffer.from(hexresult, 'hex'));
}

function stringToUint8Array(str: string, size: number = 1) {
  let buf: ArrayBuffer;
  let bufView: any;

  if (size === 1) {
    buf = new ArrayBuffer(str.length);
    bufView = new Uint8Array(buf);
  }
  if (size === 2) {
    buf = new ArrayBuffer(str.length * 2);
    bufView = new Uint16Array(buf);
  }
  if (size === 4) {
    buf = new ArrayBuffer(str.length * 4);
    bufView = new Uint32Array(buf);
  }
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return new Uint8Array(bufView.buffer);
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const CryptoUtils = {
  stringToUint8Array,
  pbkdf2_sha512,
  hmac_sha512,
};
