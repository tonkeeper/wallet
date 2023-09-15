import { delay } from '../common';
import { CryptoUtils } from '../cryptoUtils';
import { bip39 } from './bip39';
import nacl from 'tweetnacl';

// TODO: convert to module for inject mobile or web crypto functions
const webcrypto = require('isomorphic-webcrypto');

const defaultWordlist = bip39.array;
const PBKDF_ITERATIONS = 100000;

async function isBasicSeed(entropy: ArrayBuffer) {
  const seed = await CryptoUtils.pbkdf2_sha512(
    entropy,
    'TON seed version',
    Math.max(1, Math.floor(PBKDF_ITERATIONS / 256)),
  );
  return seed[0] == 0;
}

async function isPasswordSeed(entropy: ArrayBuffer) {
  const seed = await CryptoUtils.pbkdf2_sha512(entropy, 'TON fast seed version', 1);
  return seed[0] == 1;
}

async function mnemonicToEntropy(mnemonicArray: string[], password: string = '') {
  const mnemonicPhrase = mnemonicArray.join(' ');
  const mnemonicPhraseBuffer = CryptoUtils.stringToUint8Array(mnemonicPhrase);
  return await CryptoUtils.hmac_sha512(mnemonicPhraseBuffer, password);
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
  const seed = await CryptoUtils.pbkdf2_sha512(
    entropy,
    'TON default seed',
    PBKDF_ITERATIONS,
  );
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
  if (webcrypto.ensureSecure) {
    await webcrypto.ensureSecure(); // requirement by isomorphic-webcrypto
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
    const rnd1 = webcrypto.getRandomValues(new Uint16Array(wordsCount));
    const rnd2 = webcrypto.getRandomValues(new Uint16Array(wordsCount));

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

  return mnemonicArray;
}

export const Mnemonic = {
  generateMnemonic,
  mnemonicToKeyPair,
  mnemonicToSeed,
  validateMnemonic,
};
