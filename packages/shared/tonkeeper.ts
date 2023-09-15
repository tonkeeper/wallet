import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { WalletNetwork } from '@tonkeeper/core/src/Wallet';
import { Tonkeeper, TronAPI } from '@tonkeeper/core';
import { MobileVault } from './utils/MobileVault';
import { EventStream } from './EventStream';
import { queryClient } from './queryClient';
import { TonAPI } from '@tonkeeper/core';
import { storage } from './storage';
import { config } from './config';

export const sse = new EventStream({
  baseUrl: () => config.get('tonapiIOEndpoint'),
  token: () => config.get('tonApiKey'),
});

export const tonapi = new TonAPI({
  token: () => config.get('tonApiV2Key'),
  baseUrl: () => {
    if (tk.wallet?.identity.network === WalletNetwork.testnet) {
      return config.get('tonapiTestnetHost');
    }

    return config.get('tonapiIOEndpoint');
  },
});

export const tronapi = new TronAPI({
  baseUrl: () => {
    if (tk.wallet?.identity.network === WalletNetwork.testnet) {
      return config.get('tronapiTestnetHost');
    }

    return config.get('tronapiHost');
  },
});

// const logger = new Logger({
//   onError: (err) => saveLog(err)
// });

const vault = new MobileVault(MobilePasscodeController);

export const tk = new Tonkeeper({
  queryClient,
  storage,
  tronapi,
  tonapi,
  // logger,
  vault,
  sse,
});
