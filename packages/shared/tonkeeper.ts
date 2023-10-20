// import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { AppServerSentEvents } from './modules/AppServerSentEvents';
import { Tonkeeper, TronAPI, WalletNetwork } from '@tonkeeper/core';
import { AppStorage } from './modules/AppStorage';
import { AppVault } from './modules/AppVault';
import { TonAPI } from '@tonkeeper/core';
import { config } from './config';

export const sse = new AppServerSentEvents({
  baseUrl: () => config.get('tonapiIOEndpoint'),
  token: () => config.get('tonApiV2Key'),
});

export const tonapi = new TonAPI({
  token: () => config.get('tonApiV2Key'),
  baseUrl: () => {
    if (tk.wallet?.state.getSnapshot().network === WalletNetwork.testnet) {
      return config.get('tonapiTestnetHost');
    }

    return config.get('tonapiIOEndpoint');
  },
});

export const tronapi = new TronAPI({
  baseUrl: () => {
    if (tk.wallet?.state.getSnapshot().network === WalletNetwork.testnet) {
      return config.get('tronapiTestnetHost');
    }

    return config.get('tronapiHost');
  },
});

export const storage = new AppStorage();

const vault = new AppVault(storage, {});

export const tk = new Tonkeeper({
  storage,
  tronapi,
  tonapi,
  vault,
  sse,
});
