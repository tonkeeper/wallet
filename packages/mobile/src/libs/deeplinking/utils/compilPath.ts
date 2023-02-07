export function compilePath(
  path: string,
  caseSensitive = false,
  end = true
): [RegExp, string[]] {
  let paramNames: string[] = [];
  let regexpSource =
    "^" +
    path
      .replace(/\/*\*?$/, "")
      .replace(/^\/*/, "/")
      .replace(/[\\.*+^$?{}|()[\]]/g, "\\$&")
      .replace(/:(\w+)/g, (_: string, paramName: string) => {
        paramNames.push(paramName);
        return "([^\\/]+)";
      });

  if (path.endsWith("*")) {
    paramNames.push('path');
    regexpSource +=
      path === "*" || path === "/*"
        ? "(.*)$"
        : "(?:\\/(.+)|\\/*)$";
  } else {
    regexpSource += end
      ? "\\/*$"
      : "(?:(?=[.~-]|%[0-9A-F]{2})|\\b|\\/|$)";
  }

  let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");

  return [matcher, paramNames];
}