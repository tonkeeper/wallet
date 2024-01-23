import { isString } from '@tonkeeper/uikit';
import React from 'react';

let escapeRegExp = function escapeRegExp(str: string) {
  let reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reHasRegExpChar = RegExp(reRegExpChar.source);

  return str && reHasRegExpChar.test(str) ? str.replace(reRegExpChar, '\\$&') : str;
};

export function replaceString(
  str: string,
  match: string,
  fn: (str: string, i: number, c: number) => React.ReactNode,
): React.ReactNode[] | React.ReactNode {
  let curCharStart = 0;
  let curCharLen = 0;

  if (str === '') {
    return str;
  } else if (!str || !isString(str)) {
    throw new TypeError(
      'First argument to react-string-replace#replaceString must be a string',
    );
  }

  let re = new RegExp('(' + escapeRegExp(match) + ')', 'gi');

  let matches: undefined | string[] = str.split(re);
  let toReturn: React.ReactNode = matches;

  for (let i = 1, length = matches.length; i < length; i += 2) {
    if (matches[i] === undefined || matches[i - 1] === undefined) {
      console.warn('Encountered undefined value during string replacement');
      continue;
    }

    curCharLen = matches[i].length;
    curCharStart += matches[i - 1].length;
    toReturn[i] = fn(matches[i], i, curCharStart);
    curCharStart += curCharLen;
  }

  return toReturn;
}
