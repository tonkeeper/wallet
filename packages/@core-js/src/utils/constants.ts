import { toNano } from '@ton/core';

export const ONE_TON = toNano('1');
export const BASE_FORWARD_AMOUNT = toNano('0.05');
export const TETHER_JETTON_MASTER =
  '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe';

export enum JettonMasterMethods {
  GetWalletAddress = 'get_wallet_address',
}
