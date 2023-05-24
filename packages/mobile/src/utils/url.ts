import axios, { CancelTokenSource } from 'axios';
import domainFromPartialUrl from 'domain-from-partial-url';
import queryParser from 'query-string';
import { Buffer } from 'buffer';
import { DevFeature, useDevFeaturesToggle } from '$store';

const { createHash } = require('react-native-crypto');

export const isValidUrl = (value: string) =>
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi.test(
    value,
  ) || /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/.test(value);

export const isTonUrl = (value: string) =>
  /(?:https?:\/\/)?(?:www\.)?[^.\/]+\.ton(?:\/|$)/.test(value);

export const getDomainFromURL = (url: string): string => domainFromPartialUrl(url);

export const getUrlWithTonProxy = (url: string) => {
  const regex = /(\.ton)(?=\/|$)(?!\.website)/g;

  return url.replace(regex, '.ton.website');
};

export const getUrlWithoutTonProxy = (url: string) => {
  const regex = /(\.ton)\.website(?=\/|$)/g;

  return url.replace(regex, '.ton');
};

export const getCorrectUrl = (value: string) => {
  const httpEnabled =
    useDevFeaturesToggle.getState().devFeatures[DevFeature.UseHttpProtocol];

  const protocol = httpEnabled ? 'http://' : 'https://';

  const protocolToReplace = httpEnabled ? 'https://' : 'http://';

  const fixedUrl = value.replace(protocolToReplace, protocol);

  const url = fixedUrl.startsWith(protocol) ? fixedUrl : `${protocol}${value}`;

  if (isTonUrl(url)) {
    return getUrlWithTonProxy(url);
  }

  return url;
};

export const getUrlTitle = async (url: string, cancelTokenSource: CancelTokenSource) => {
  const response = await axios.get<string>(getCorrectUrl(url), {
    cancelToken: cancelTokenSource.token,
  });

  const { parse } = await import('node-html-parser');

  const root = parse(response.data, {
    blockTextElements: {
      script: false,
      noscript: false,
      style: false,
      pre: false,
    },
  });

  const metaTitleNode = root.querySelector(
    'meta[property="og:title"], meta[property="twitter:title"], meta[property="og:site_name"]',
  );

  if (metaTitleNode) {
    return metaTitleNode.attributes.content;
  }

  const titleNode = root.querySelector('title');

  if (titleNode) {
    return titleNode.text;
  }

  throw new Error('title not found');
};

export const getFixedLastSlashUrl = (url: string) => {
  return url.replace(/\/$/, '');
};

export const generateAppHashFromUrl = (url: string) => {
  // get url without query
  const { url: parsedUrl } = queryParser.parseUrl(url);

  // remove last slash if it exists
  const fixedUrl = getFixedLastSlashUrl(parsedUrl);

  const hash = createHash('sha256').update(Buffer.from(fixedUrl)).digest('hex');

  return hash;
};

export const getSearchQuery = (url: string) => {
  const parsed = queryParser.parseUrl(url);

  const isGoogle = [
    'https://google.com/search',
    'https://www.google.com/search',
  ].includes(parsed.url);

  if (isGoogle && parsed.query.q) {
    return parsed.query.q as string;
  }

  const isDuckDuckGo = [
    'https://duckduckgo.com/',
    'https://www.duckduckgo.com/',
  ].includes(parsed.url);

  if (isDuckDuckGo && parsed.query.q) {
    return parsed.query.q as string;
  }

  return null;
};
