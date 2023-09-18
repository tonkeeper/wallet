import { getServerConfig } from '$shared/constants';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { network } from '$libs/network';
import { Address } from '@tonkeeper/core';

const prepareHeaders = (restHeaders?: { [key: string]: string }) => {
  return {
    Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
    Build: DeviceInfo.getBuildNumber(),
    ...(restHeaders ?? {}),
  };
};

const getBulkInfo = async (addresses: string[]) => {
  const endpoint = getServerConfig('tonapiIOEndpoint');

  const resp = await axios.post(
    `${endpoint}/v1/account/getBulkInfo`,
    {
      addresses: addresses.join(','),
    },
    {
      headers: prepareHeaders(),
    },
  );
};

const findByPubkey = async (pubkey: string) => {
  const endpoint = getServerConfig('tonapiIOEndpoint');

  try {
    const resp = await axios.get(`${endpoint}/v1/wallet/findByPubkey`, {
      params: {
        public_key: pubkey,
      },
      headers: prepareHeaders(),
    });

    if (!resp.data.wallets) {
      console.log(resp.data);
    }

    return resp.data?.wallets ?? [];
  } catch (err) {
    console.log(err, err.response.data);
    return [];
  }
};

async function getWalletInfo(address: string) {
  try {
    const endpoint = getServerConfig('tonapiV2Endpoint');
    const response: any = await axios.get(`${endpoint}/v2/accounts/${address}`, {
      headers: prepareHeaders({
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      }),
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

type Balances = {
  balance: number;
  version: string;
};

async function resolveDns(domain: string, signal?: AbortSignal) {
  try {
    const endpoint = getServerConfig('tonapiV2Endpoint');
    const response: any = await axios.get(`${endpoint}/v2/dns/${domain}/resolve`, {
      headers: prepareHeaders({
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
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

async function getJettonBalances(address: string) {
  try {
    if (!Address.isValid(address)) {
      throw new Error('Wrong address');
    }
    const endpoint = getServerConfig('tonapiV2Endpoint');

    const resp: any = await axios.get(`${endpoint}/v2/accounts/${address}/jettons`, {
      headers: prepareHeaders({
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      }),
    });
    return resp.data;
  } catch (e) {
    console.log(e);
  }
}

async function estimateTx(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.post(
      `${endpoint}/v1/send/estimateTx`,
      {
        boc,
      },
      {
        headers: prepareHeaders(),
      },
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}
/*async function estimateTx(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiV2Endpoint');
    const response: any = await axios.post(
      `${endpoint}/v2/blockchain/message/emulate`,
      {
        boc,
      },
      {
        headers: prepareHeaders({
          Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
        }),
      },
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}*/

/*async function sendBoc(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiV2Endpoint');
    const response: any = await axios.post(
      `${endpoint}/v2/blockchain/message`,
      {
        boc,
      },
      {
        headers: prepareHeaders({
          Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
        }),
      },
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}*/

async function sendBoc(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.post(
      `${endpoint}/v1/send/boc`,
      {
        boc,
      },
      {
        headers: prepareHeaders(),
      },
    );
    return response.data;
  } catch (e) {
    console.log(e);
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
    const endpoint = getServerConfig('tonapiIOEndpoint');
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
}

async function unsubscribeFromNotifications(
  token: string,
  params: UnsubscribeToNotificationsParams,
) {
  try {
    const endpoint = getServerConfig('tonapiIOEndpoint');
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
async function getBalances(pubkey: string) {
  const wallets = await findByPubkey(pubkey);

  const balances: Balances[] = [];
  for (let wallet of wallets) {
    const versions = ['wallet_v3R1', 'wallet_v3R2', 'wallet_v4R1', 'wallet_v4R2'];
    const detectedVersion = wallet.interfaces.find((version) =>
      versions.includes(version),
    );
    if (detectedVersion) {
      if (wallet.balance > 0) {
        const version = detectedVersion.replace('wallet_', '');
        balances.push({
          balance: wallet.balance,
          version,
        });
      }
    }
  }

  return balances;
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
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
      params: {
        period: params.period,
      },
    },
  );
};

const getDNSLastFillTime = async (domainAddress: string): Promise<number> => {
  const { data } = await network.get(
    `https://tonapi.io/v2/blockchain/accounts/${domainAddress}/methods/get_last_fill_up_time`,
    {
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
    },
  );

  return data?.decoded.last_fill_up_time || 0;
};

export const Tonapi = {
  getJettonBalances,
  getBulkInfo,
  findByPubkey,
  getWalletInfo,
  getBalances,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  resolveDns,
  estimateTx,
  sendBoc,
  getExpiringDNS,
  getDNSLastFillTime,
};
