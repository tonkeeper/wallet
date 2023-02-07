export const dnsToUsername = (dns?: string) => {
  return dns ? '@' + dns.replace('.t.me', '') : '';
};