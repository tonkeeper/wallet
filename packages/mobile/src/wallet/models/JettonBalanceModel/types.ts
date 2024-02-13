export interface JettonMetadata {
  address: string;
  decimals: number;
  symbol?: string;
  image_data?: string;
  image?: string;
  description?: string;
  name?: string;
}

export enum JettonVerification {
  WHITELIST = 'whitelist',
  NONE = 'none',
  BLACKLIST = 'blacklist',
}
