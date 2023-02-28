import { getServerConfig } from '$shared/constants';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { Ton } from '$libs/Ton/Ton';

const prepareHeaders = (restHeaders?: { [key: string]: string }) => {
  return {
    Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
    Build: DeviceInfo.getBuildNumber(),
    ...(restHeaders ?? {}),
  }
}

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
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.get(`${endpoint}/v1/account/getInfo`, {
      headers: prepareHeaders(),
      params: {
        account: address,
      },
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
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.get(`${endpoint}/v1/dns/resolve`, {
      headers: prepareHeaders(),
      params: {
        name: domain,
      },
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
    if (!Ton.isValidAddress(address)) {
      throw new Error('Wrong address');
    }
    const endpoint = getServerConfig('tonapiIOEndpoint');

    const resp: any = await axios.get(`${endpoint}/v1/jetton/getBalances`, {
      headers: prepareHeaders(),
      params: {
        account: address,
      },
    });
    return resp.data;
  } catch (e) {
    console.log(e);
  }
}

async function estimateTx(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.post(`${endpoint}/v1/send/estimateTx`, {
      boc,
    }, {
      headers: prepareHeaders(),
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

async function sendBoc(boc: string) {
  try {
    const endpoint = getServerConfig('tonapiIOEndpoint');
    const response: any = await axios.post(`${endpoint}/v1/send/boc`, {
      boc,
    }, {
      headers: prepareHeaders(),
    });
    return response.data;
  } catch (e) {
    console.log(e);
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

export const Tonapi = {
  getJettonBalances,
  getBulkInfo,
  findByPubkey,
  getWalletInfo,
  getBalances,
  resolveDns,
  estimateTx,
  sendBoc,
};
