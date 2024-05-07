export enum RechargeMethodType {
  TON = 'TON',
  JETTON = 'JETTON',
}

export interface RechargeMethod {
  type: RechargeMethodType;
  key: string;
  title: string;
  markup: number;
  decimals: number;
}
