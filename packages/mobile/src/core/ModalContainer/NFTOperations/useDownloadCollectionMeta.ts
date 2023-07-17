import { debugLog } from '$utils';
import React from 'react';
import { getServerConfig } from '$shared/constants';
import { NFTApi, Configuration } from '@tonkeeper/core/src/legacy';

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
      const endpoint = getServerConfig('tonapiV2Endpoint');
      const nftApi = new NFTApi(
        new Configuration({
          basePath: endpoint,
          headers: {
            Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
          },
        }),
      );

      const collection = await nftApi.getNftCollection({ accountId: address });
      setMeta(collection.metadata as NFTCollectionMeta);
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
