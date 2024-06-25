import { toNano } from '@ton/core';

export const ONE_TON = toNano('1');
export const POINT_ONE_TON = toNano('0.1');
export const BASE_FORWARD_AMOUNT = toNano('0.05');

export const STONFI_CONSTANTS = {
  routerAddress: '0:779dcc815138d9500e449c5291e7f12738c23d575b5310000f6a253bd607384e',
  TONProxyAddress: '0:8cdc1d7640ad5ee326527fc1ad0514f468b30dc84b0173f0e155f451b4e11f7c',
  JettonToJettonSwapFees: {
    gasAmount: BigInt('265000000'),
    forwardGasAmount: BigInt('205000000'),
  },
};
