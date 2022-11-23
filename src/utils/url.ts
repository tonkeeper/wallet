import domainFromPartialUrl from 'domain-from-partial-url';

export const isValidUrl = (value: string) =>
  /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/.test(value);

export const getDomainFromURL = (url: string): string => domainFromPartialUrl(url);
