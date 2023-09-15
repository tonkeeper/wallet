export function isString<T>(str: T) {
  return typeof str === 'string';
}

export function toLowerCaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
