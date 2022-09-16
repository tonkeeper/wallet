import TonWeb from 'tonweb';

export function maskifyAddress(address: string, symbolsInPart: number = 4) {
  if (!address) {
    address = '';
  }

  const initialPart = address.substring(0, symbolsInPart);
  const finalPart = address.substring(address.length - symbolsInPart);
  const ellipsis = '...';

  return initialPart + ellipsis + finalPart;
}

export function maskifyTonAddress(address: string) {
  return maskifyAddress(address);
}

export const isValidAddress = (str: string) => TonWeb.Address.isValid(str);

export const compareAddresses = (adr1: string, adr2: string) => {
  if (!TonWeb.Address.isValid(adr1) || !TonWeb.Address.isValid(adr2)) {
    return false;
  }
  return (
    new TonWeb.Address(adr1).toString(false) === new TonWeb.Address(adr2).toString(false)
  );
};
