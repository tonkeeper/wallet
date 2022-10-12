import { getServerConfig } from "$shared/constants";
import axios from "axios";

const getBulkInfo = async (addresses: string[]) => {
  const endpoint = getServerConfig('tonapiIOEndpoint');

  const resp = await axios.post(`${endpoint}/v1/account/getBulkInfo`, {
    addresses: addresses.join(',')
  }, {
    headers: {
      Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
    }
  });
};


const findByPubkey = async (pubkey: string) => {
  const endpoint = getServerConfig('tonapiIOEndpoint');

  try {
    const resp = await axios.get(`${endpoint}/v1/wallet/findByPubkey`, {
      params: {
        public_key: pubkey
      },
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      }
    });

    if (!resp.data.wallets) {
      console.log(resp.data);
    }

    return resp.data?.wallets ?? []
  } catch (err) {
    console.log(err, err.response.data)
  } 
}
export const Tonapi = {
  getBulkInfo,
  findByPubkey
}