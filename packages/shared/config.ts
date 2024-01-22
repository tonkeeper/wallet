import { AppStorage } from './modules/AppStorage';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from './modules/AppConfig';
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
  tronapiHost: string;
  tronapiTestnetHost: string;
  disable_show_unverified_token: boolean;
};

const defaultConfig: Partial<AppConfigVars> = {
  tonapiTestnetHost: 'https://testnet.tonapi.io',
  tonapiIOEndpoint: 'https://keeper.tonapi.io',
  tonapiV2Endpoint: 'https://tonapi.io',
  tronapiHost: 'https://tron.tonkeeper.com',
  tronapiTestnetHost: 'https://testnet-tron.tonkeeper.com',
  disable_show_unverified_token: false,
};

export const config = new AppConfig<AppConfigVars>({
  storage: new AppStorage(),
  defaultConfig,
  request: {
    host: 'https://boot.tonkeeper.com/keys',
    params: () => ({
      build: DeviceInfo.getReadableVersion(),
      platform: Platform.OS,
    }),
  },
});
