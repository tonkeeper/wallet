import { getServerConfig } from '$shared/constants';
import axios from 'axios';

const getBulkInfo = async (addresses: string[]) => {
  const endpoint = getServerConfig('tonapiIOEndpoint');

  const resp = await axios.post(
    `${endpoint}/v1/account/getBulkInfo`,
    {
      addresses: addresses.join(','),
    },
    {
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
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
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
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
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
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
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
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
  getBulkInfo,
  findByPubkey,
  getWalletInfo,
  getBalances,
  resolveDns,
};
