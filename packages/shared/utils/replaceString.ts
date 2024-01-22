import { isString } from '@tonkeeper/uikit';

export function replaceString(str, match, fn) {
  let curCharStart = 0;
  let curCharLen = 0;

  if (str === '') {
    return str;
  } else if (!str || !isString(str)) {
    throw new TypeError(
      'First argument to react-string-replace#replaceString must be a string',
    );
  }

  let result = str.split(match);

  // Apply fn to all odd elements
  for (let i = 1, length = result.length; i < length; i += 2) {
    /** @see {@link https://github.com/iansinnott/react-string-replace/issues/74} */
    if (result[i] === undefined || result[i - 1] === undefined) {
      console.warn('Encountered undefined value during string replacement');
      continue;
    }

    curCharLen = result[i].length;
    curCharStart += result[i - 1].length;
    result[i] = fn(result[i], i, curCharStart);
    curCharStart += curCharLen;
  }

  return result;
}
