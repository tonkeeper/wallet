import { debugLog } from '$utils/debugLog';
import axios from 'axios';
import React from 'react';
import { proxyMedia } from '$utils/proxyMedia';
import { config } from '$config';
import { tk } from '$wallet';

export type NFTItemMeta = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  marketplace: string;
};

export function useDownloadNFT(addr?: string) {
  const [data, setNFT] = React.useState<any>(undefined);

  const download = React.useCallback(async (address: string) => {
    try {
      const endpoint = config.get('tonapiV2Endpoint', tk.wallet.isTestnet);

      const response: any = await axios.post(
        `${endpoint}/v2/nfts/_bulk`,
        {
          account_ids: [address],
        },
        {
          headers: {
            Authorization: `Bearer ${config.get('tonApiV2Key', tk.wallet.isTestnet)}`,
          },
        },
      );
      const nft = response.data.nft_items[0];
      const image =
        (nft.previews &&
          nft.previews.find((preview) => preview.resolution === '500x500').url) ||
        (nft.metadata?.image && proxyMedia(nft.metadata?.image, 512, 512));
      if (image && nft.metadata) {
        nft.metadata.image = image;
      }
      setNFT(nft);
    } catch (err) {
      debugLog('Error download nft meta', err);
    }
  }, []);

  React.useEffect(() => {
    if (addr) {
      download(addr);
    }
  }, []);

  return { data, download };
}
