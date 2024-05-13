import { TronAPI } from '@tonkeeper/core';
import { BatteryAPI } from '@tonkeeper/core/src/BatteryAPI';
import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { config } from '$config';
import { i18n } from '@tonkeeper/shared/i18n';
import { WalletContractVersion } from './WalletTypes';
import { DEFAULT_WALLET_VERSION } from './constants';

export const createTonApiInstance = (isTestnet = false) => {
  return new TonAPI({
    baseHeaders: () => ({
      Authorization: `Bearer ${config.get('tonApiV2Key', isTestnet)}`,
      'Cache-Control': 'no-cache',
    }),
    baseUrl: () => config.get('tonapiIOEndpoint', isTestnet),
  });
};

export const createBatteryApiInstance = (isTestnet = false) => {
  return new BatteryAPI({
    baseUrl: () => {
      if (isTestnet) {
        return config.get('batteryTestnetHost');
      }

      return config.get('batteryHost');
    },
    baseHeaders: {
      'Accept-Language': i18n.locale,
    },
  });
};

export const createTronApiInstance = (isTestnet = false) => {
  return new TronAPI({
    baseUrl: () => {
      if (isTestnet) {
        return config.get('tronapiTestnetHost');
      }

      return config.get('tronapiHost');
    },
  });
};
