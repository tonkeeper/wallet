import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@tonkeeper/core';
import { Platform } from 'react-native';

type AppConfigVars = {
  tonapiTestnetHost: string;
  tonapiProdHost: string;
  tonapiDevHost: string;
  tonapiAuthToken: string;
};

const defaultConfig: Partial<AppConfigVars> = {
  tonapiProdHost: '',
  tonapiDevHost: '',
  tonapiTestnetHost: '',
};

export const config = new AppConfig<AppConfigVars>({
  defaultConfig,
  request: {
    host: 'https://boot.tonkeeper.com/keys',
    params: () => ({
      build: DeviceInfo.getReadableVersion(),
      platform: Platform.OS,
    }),
  },
});
