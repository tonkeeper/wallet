import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@tonkeeper/core';
import { Platform } from 'react-native';

type AppConfigVars = {
  // tonapiTestnetHost: string;
  // tonapiProdHost: string;
  // tonapiDevHost: string;
  // tonapiAuthToken: string;
  tonapiIOEndpoint: string;
  tonapiV2Endpoint: string;
  tonApiV2Key: string;
  tonApiKey: string;
  transactionExplorer: string;
  tonapiTestnetHost: string;
};

const defaultConfig: Partial<AppConfigVars> = {
  tonapiTestnetHost: 'https://testnet.tonapi.io',
  tonapiIOEndpoint: 'https://keeper.tonapi.io',
  tonapiV2Endpoint: 'https://tonapi.io',
};

export const config = new AppConfig<AppConfigVars>({
  storage: AsyncStorage,
  defaultConfig,
  request: {
    host: 'https://boot.tonkeeper.com/keys',
    params: () => ({
      build: DeviceInfo.getReadableVersion(),
      platform: Platform.OS,
    }),
  },
});
