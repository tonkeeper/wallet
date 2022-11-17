import axios from 'axios';
import { i18n } from '$translation';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { t } from '$translation';
import { getIsTestnet } from '$database';
import { getServerConfigSafe } from '$shared/constants/serverConfig';

export const Api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

Api.interceptors.request.use(
  async (config) => {
    const isTestnet = await getIsTestnet();
    let tonkeeperEndpoint = getServerConfigSafe('tonkeeperEndpoint');

    if (tonkeeperEndpoint === 'none') {
      tonkeeperEndpoint = 'https://api.tonkeeper.com'; // fallback
    }

    return {
      ...config,
      baseURL: `${tonkeeperEndpoint}/v1`,
      headers: {
        ...config.headers,
        lang: i18n.locale,
        platform: Platform.OS,
        build: DeviceInfo.getReadableVersion(),
        chainName: isTestnet ? 'testnet' : 'mainnet',
      },
    };
  },
  (error) => {
    console.warn('error', error);
    return Promise.reject(error);
  },
);

Api.interceptors.response.use(
  (response) => {
    if (['document', 'text'].indexOf(response.config.responseType as string) > -1) {
      return response.data;
    }

    if (response.data && 'success' in response.data) {
      return response.data.success
        ? Promise.resolve(response.data.data)
        : Promise.reject({
            ...response.data.data,
            message: response.data.data.error_reason,
          });
    } else {
      return Promise.reject(response.data);
    }
  },
  (error) => {
    if (error.message === 'Network Error') {
      return Promise.reject({
        message: t('error_network'),
        isNetworkError: true,
      });
    }

    if (error.response && error.response.data && 'success' in error.response.data) {
      return Promise.reject({
        ...error.response.data.data,
        message: error.response.data.data.error_reason,
      });
    } else {
      return Promise.reject(error.response ? error.response.data : error);
    }
  },
);
