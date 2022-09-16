import nacl from 'tweetnacl';
import { NativeModules } from 'react-native';
import { delay } from '$utils/delay';
import { wordlist } from './wordlist';

const createHmac = require('create-hmac');
const crypto = require('isomorphic-webcrypto');

const { TonPbkdf2 } = NativeModules;
const defaultWordlist = wordlist.english;

function stringToArray(str: string, size: number = 1) {
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

const PBKDF_ITERATIONS = 100000;

async function hmac_sha512(phrase: string, password: string) {
  const phraseBuffer = stringToArray(phrase);
  const passwordBuffer = password.length
    ? stringToArray(password)
    : new Uint8Array(new ArrayBuffer(0));
  return createHmac('sha512', phraseBuffer).update(passwordBuffer).digest();
}

async function pbkdf2_sha512(key: ArrayBuffer, salt: string, iterations: number) {
  const hexkey = bufferToHex(key);
  const hexresult = await TonPbkdf2.derivationKey(hexkey, salt, iterations);
  return new Uint8Array(Buffer.from(hexresult, 'hex'));
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function isBasicSeed(entropy: ArrayBuffer) {
  const seed = await pbkdf2_sha512(
    entropy,
    'TON seed version',
    Math.max(1, Math.floor(PBKDF_ITERATIONS / 256)),
  );
  return seed[0] == 0;
}

async function isPasswordSeed(entropy: ArrayBuffer) {
  const seed = await pbkdf2_sha512(entropy, 'TON fast seed version', 1);
  return seed[0] == 1;
}

async function mnemonicToEntropy(mnemonicArray: string[], password: string = '') {
  const mnemonicPhrase = mnemonicArray.join(' ');
  return await hmac_sha512(mnemonicPhrase, password);
}

export async function validateMnemonic(
  mnemonicArray: string[],
  password: string = '',
  wordlist: string[] | Map<string, any> = defaultWordlist,
) {
  for (let word of mnemonicArray) {
    const wordlistMap = wordlist as Map<string, any>;
    if (wordlistMap.has) {
      if (!wordlistMap.has(word)) {
        return false;
      }
    } else {
      const wordlistArr = wordlist as string[];
      if (wordlistArr.indexOf(word) < 0) {
        return false;
      }
    }

    await delay(1); // for release event loop
  }
  if (password.length > 0) {
    if (!(await isPasswordNeeded(mnemonicArray))) {
      return false;
    }
  }
  return await isBasicSeed(await mnemonicToEntropy(mnemonicArray, password));
}

async function isPasswordNeeded(mnemonicArray: string[]) {
  // password mnemonic (without password) should be password seed, but not basic seed
  const passlessEntropy = await mnemonicToEntropy(mnemonicArray, '');
  return (await isPasswordSeed(passlessEntropy)) && !(await isBasicSeed(passlessEntropy));
}

async function mnemonicToSeed(mnemonicArray: string[], password: string = '') {
  const entropy = await mnemonicToEntropy(mnemonicArray, password);
  const seed = await pbkdf2_sha512(entropy, 'TON default seed', PBKDF_ITERATIONS);
  return seed.slice(0, 32);
}

export async function mnemonicToKeyPair(mnemonicArray: string[], password: string = '') {
  const seed = await mnemonicToSeed(mnemonicArray, password);
  return nacl.sign.keyPair.fromSeed(seed);
}

export async function generateMnemonic(
  wordsCount: number = 24,
  password: string = '',
  wordlist: string[] = defaultWordlist,
): Promise<string[]> {
  if (crypto.ensureSecure) {
    await crypto.ensureSecure(); // requirement by isomorphic-webcrypto
  }
  //const start_time = Date.now()
  let c = 0;
  let mnemonicArray: string[] = [];
  while (true) {
    c += 1;
    mnemonicArray = [];
    // hmm, react does not return 16-bit values, but returns 8-bit ones.
    // in case this changes, we'll just be correctly truncating numbers, but their combination
    // guarantees double entropy from the generated numbers.
    const rnd1 = crypto.getRandomValues(new Uint16Array(wordsCount));
    const rnd2 = crypto.getRandomValues(new Uint16Array(wordsCount));

    for (let i = 0; i < wordsCount; i++) {
      const r = (rnd1[i] % 256) * 256 + (rnd2[i] % 256);
      mnemonicArray.push(wordlist[r & 2047]); // We loose 5 out of 16 bits of entropy here, good enough
    }
    if (password.length > 0) {
      if (!(await isPasswordNeeded(mnemonicArray))) continue;
    }
    const entropy = await mnemonicToEntropy(mnemonicArray, password);
    const basicSeed = await isBasicSeed(entropy);
    if (!basicSeed) {
      continue;
    }
    break;
  }
  //console.debug("Mnemonic generation attempts:", c, "time", Date.now() - start_time);
  return mnemonicArray;
}
