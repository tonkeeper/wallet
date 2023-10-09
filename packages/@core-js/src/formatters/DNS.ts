// list of know for client TLDs for TON DNS
export enum KnownTLDs {
  TON = 'ton',
  TELEGRAM = 't.me',
}

export class DNS {
  // get known TLD from domain. Uses for TLD-specific features like Telegram buttons in UI
  static getTLD(domain: string) {
    if (!DNS.isValid(domain)) {
      return null;
    }

    if (domain.endsWith(KnownTLDs.TON)) {
      return KnownTLDs.TON;
    }

    if (domain.endsWith(KnownTLDs.TELEGRAM)) {
      return KnownTLDs.TELEGRAM;
    }

    return null;
  }

  static isValid(domain?: string) {
    if (!domain) {
      return false;
    }
    return domain.includes('.');
  }
}
