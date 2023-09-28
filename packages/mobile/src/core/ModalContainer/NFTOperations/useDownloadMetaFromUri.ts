import { debugLog } from '$utils/debugLog';
import axios from 'axios';
import React from 'react';

export function useDownloadMetaFromUri<T = any>(contentUri?: string) {
  const [data, setMeta] = React.useState<T | undefined>(undefined);

  const download = React.useCallback(async (contentUri: string) => {
    try {
      const response = await axios.get(contentUri);
      setMeta(response.data);
    } catch (err) {
      debugLog('Error download nft meta', err);
    }
  }, []);

  React.useEffect(() => {
    if (contentUri) {
      download(contentUri);
    }
  }, []);

  return { data, download };
}
