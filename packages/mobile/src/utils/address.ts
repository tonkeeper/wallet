import { Address } from '@tonkeeper/core';
import TonWeb from 'tonweb';

export function maskifyTonAddress(address: string) {
  return Address.toShort(address);
}

export const isValidAddress = (str: string) => TonWeb.Address.isValid(str);

export const compareAddresses = (adr1?: string, adr2?: string) => {
  if (adr1 === undefined || adr2 === undefined) {
    return false;
  } 

  if (!TonWeb.Address.isValid(adr1) || !TonWeb.Address.isValid(adr2)) {
    return false;
  }

  try {
    return (
      new TonWeb.Address(adr1).toString(false) === new TonWeb.Address(adr2).toString(false)
    );
  } catch {
    return false;
  }
};