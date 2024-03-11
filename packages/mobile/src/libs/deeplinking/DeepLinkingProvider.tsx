import { delay } from '$utils';
import { debugLog } from '$utils/debugLog';
import React from 'react';
import {
  DeepLinkingContextValue,
  DeeplinkingResolveOptions,
  DeeplinkingResolver,
  DeeplinkOrigin,
} from './deeplinking.types';
import { DeepLinkingContext } from './DeepLinkingContext';
import { useDeeplinkingListener } from './hooks/useDeeplinkingListener';
import { applyMiddleware, matchPath, Middleware } from './utils';

interface DeepLinkingProviderProps {
  useIsReadyToListen?: () => boolean;
  useResolvers: () => void;
}

export const DeepLinkingProvider: React.FC<DeepLinkingProviderProps> = (props) => {
  const resolvers = React.useRef<Map<string, DeeplinkingResolver>>(new Map()).current;
  const middleware = React.useRef<Middleware | undefined>();
  const prefixes = React.useRef<string[]>([]);

  const add = (pathname: string, resolver: DeeplinkingResolver) => {
    if (!resolvers.has(pathname)) {
      resolvers.set(pathname, resolver);
    }
  };

  const getResolver = (url: string, options?: DeeplinkingResolveOptions) => {
    try {
      const prefix = prefixes.current.find((prefix) => {
        return url.startsWith(prefix);
      });

      if (!prefix) {
        return null;
      }

      let pathname = url.substring(prefix.length);
      if (!pathname.startsWith('/')) {
        pathname = `/${pathname}`;
      }

      for (let path of resolvers.keys()) {
        const matchedPath = matchPath(path, pathname);
        if (matchedPath) {
          const resolver = resolvers.get(path)!;

          return async () => {
            if (options?.delay) {
              await delay(options?.delay);
            }

            const middlewares: Middleware[] = [];
            if (middleware.current) {
              middlewares.push(middleware.current);
            }

            const resolveOptions = {
              prefix,
              origin: options?.origin || DeeplinkOrigin.DEEPLINK,
              params: matchedPath.params,
              query: matchedPath.query,
              resolveParams: options?.params ?? {},
            };

            applyMiddleware(middlewares, { ...resolveOptions, pathname }, () => {
              return resolver(resolveOptions);
            });
          };
        }
      }
    } catch (err) {
      debugLog('[Deeplinking]: error parse', url, err);
    }

    return null;
  };

  const resolve = (url: string, options?: DeeplinkingResolveOptions) => {
    try {
      const resolver = getResolver(url, options);
      if (resolver) {
        resolver();
      }
    } catch (err) {
      debugLog('[Deeplinking]: error resolve', url, err);
    }
  };

  const addMiddleware = (fn: Middleware) => {
    middleware.current = fn;
  };

  const setPrefixes = (arr: string[]) => {
    prefixes.current = arr;
  };

  const value: DeepLinkingContextValue = {
    addMiddleware,
    setPrefixes,
    getResolver,
    resolve,
    add,
  };

  return (
    <DeepLinkingContext.Provider value={value}>
      <DeepLinkingListener
        useIsReadyToListen={props.useIsReadyToListen}
        useResolvers={props.useResolvers}
      />
      {props.children}
    </DeepLinkingContext.Provider>
  );
};

const DeepLinkingListener = (props: DeepLinkingProviderProps) => {
  useDeeplinkingListener(props);

  return null;
};
