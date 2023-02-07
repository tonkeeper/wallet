import { debugLog } from '$utils';
import axios from 'axios';
import React from 'react';
import { getServerConfig } from '$shared/constants';
import { getChainName } from '$shared/dynamicConfig';

export type NFTCollectionMeta = {
  name: string;
  description: string;
  image: string;
  cover_image: string;
  social_links: any[];
  external_url: string;
  marketplace: string;
};

export function useDownloadCollectionMeta(addr?: string) {
  const [data, setMeta] = React.useState<NFTCollectionMeta | undefined>(undefined);

  const download = React.useCallback(async (address: string) => {
    try {
      const endpoint = getServerConfig('tonapiIOEndpoint');

      const response: any = await axios.get(`${endpoint}/v1/nft/getCollection`, {
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
        },
        params: {
          account: address,
        },
      });
      setMeta(response.data.metadata);
    } catch (err) {
      debugLog('Error download collection meta', err);
    }
  }, []);

  React.useEffect(() => {
    if (addr) {
      download(addr);
    }
  }, []);

  return { data, download };
}
