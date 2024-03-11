import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { network } from '$libs/network';
import { config } from '../../config';

const prepareHeaders = (restHeaders?: { [key: string]: string }) => {
  return {
    Authorization: `Bearer ${config.get('tonApiKey')}`,
    Build: DeviceInfo.getBuildNumber(),
    ...(restHeaders ?? {}),
  };
};

async function resolveDns(domain: string, signal?: AbortSignal) {
  try {
    const endpoint = config.get('tonapiV2Endpoint');
    const response: any = await axios.get(`${endpoint}/v2/dns/${domain}/resolve`, {
      headers: prepareHeaders({
        Authorization: `Bearer ${config.get('tonApiV2Key')}`,
      }),
      signal,
    });
    return response.data;
  } catch (e) {
    if (axios.isCancel(e)) {
      return 'aborted';
    }
    return false;
  }
}

export interface SubscribeToNotificationsRequest {
  app_url: string;
  account: string;
  firebase_token: string;
  session_id?: string;
  commercial: boolean;
  silent: boolean;
}
async function subscribeToNotifications(
  token: string,
  request: SubscribeToNotificationsRequest,
) {
  try {
    const endpoint = config.get('tonapiIOEndpoint');
    const response: any = await axios.post(
      `${endpoint}/v1/internal/pushes/tonconnect`,
      request,
      {
        headers: prepareHeaders({
          'X-TonConnect-Auth': token,
        }),
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(`Unable to subscribe to notifications: ${e.message}`);
  }
}

export interface UnsubscribeToNotificationsParams {
  app_url: string;
  firebase_token: string;
  account: string;
}

async function unsubscribeFromNotifications(
  token: string,
  params: UnsubscribeToNotificationsParams,
) {
  try {
    const endpoint = config.get('tonapiIOEndpoint');
    const response: any = await axios.delete(
      `${endpoint}/v1/internal/pushes/tonconnect`,
      {
        params,
        headers: prepareHeaders({
          'X-TonConnect-Auth': token,
        }),
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(`Unable to unsubscribe from notifications: ${e.message}`);
  }
}

type GetExpiringDNSParams = {
  account_id: string;
  period: number;
};

const getExpiringDNS = async (params: GetExpiringDNSParams) => {
  return await network.get(
    `https://tonapi.io/v2/accounts/${params.account_id}/dns/expiring`,
    {
      headers: {
        Authorization: `Bearer ${config.get('tonApiV2Key')}`,
      },
      params: {
        period: params.period,
      },
    },
  );
};

export const Tonapi = {
  subscribeToNotifications,
  unsubscribeFromNotifications,
  resolveDns,
  getExpiringDNS,
};
