import queryParser from 'query-string';
import { compilePath } from "./compilPath";

export function matchPath<
  ParamKey extends string,
  Path extends string
>(
  pattern: PathPattern<Path> | Path,
  url: string
) {
  const parsedQuery = queryParser.parseUrl(url);
  const query = parsedQuery.query as StringObj;
  const pathname = parsedQuery.url;

  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }

  let [matcher, paramNames] = compilePath(
    pattern.path,
    pattern.caseSensitive,
    pattern.end
  );

  let match = pathname.match(matcher);
  if (!match) return null;

  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params: Params = paramNames.reduce<Mutable<Params>>(
    (memo, paramName, index) => {
      let query = '';
      if (paramName === "path") {
        const rawQuery = url.split('?')[1];
        if (rawQuery) {
          query =  rawQuery ? `?${rawQuery}` : '';
        }
        
        const splatValue = captureGroups[index] ?? '';
        pathnameBase = matchedPathname
          .slice(0, matchedPathname.length - splatValue.length)
          .replace(/(.)\/+$/, "$1");
      }

      const paramValue = captureGroups[index];
      memo[paramName] = `${paramValue}${query}`;
      return memo;
    },
    {}
  );

  return {
    query,
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern,
  };
}