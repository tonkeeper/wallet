import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { AppServerSentEvents } from './modules/AppServerSentEvents';
import { WalletNetwork } from '@tonkeeper/core/src/Wallet';
import { Tonkeeper, TronAPI } from '@tonkeeper/core';
import { AppStorage } from './modules/AppStorage';
import { AppVault } from './modules/AppVault';
import { queryClient } from './queryClient';
import { TonAPI } from '@tonkeeper/core';
import { config } from './config';
import { BatteryAPI } from '@tonkeeper/core/src/BatteryAPI';

export const sse = new AppServerSentEvents({
  baseUrl: () => config.get('tonapiIOEndpoint'),
  token: () => config.get('tonApiV2Key'),
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

export const batteryapi = new BatteryAPI({
  baseUrl: () => {
    if (tk.wallet?.identity.network === WalletNetwork.testnet) {
      return config.get('batteryTestnetHost');
    }

    return config.get('batteryHost');
  },
});

export const storage = new AppStorage();

const vault = new AppVault(storage, MobilePasscodeController);

export const tk = new Tonkeeper({
  queryClient,
  storage,
  tronapi,
  tonapi,
  batteryapi,
  vault,
  sse,
});
