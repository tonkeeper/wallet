export function toLowerCaseFirstLetter<T extends string>(string: T): Uncapitalize<T> {
  return (string.charAt(0).toLowerCase() + string.slice(1)) as Uncapitalize<T>;
}
