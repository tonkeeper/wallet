import { useEffect, useMemo, useState } from 'react';
import { CellItemToRender } from './types';
import { WalletContentReceiver } from './receiver';
import { useWallet } from '@tonkeeper/shared/hooks';

export const usePreparedWalletContent = () => {
  const wallet = useWallet();
  const providersReceiver = useMemo(() => new WalletContentReceiver(), [wallet]);
  const [preparedContent, setPreparedContent] = useState<CellItemToRender[]>([]);

  useEffect(() => {
    return () => providersReceiver.destroy();
  }, [providersReceiver]);

  useEffect(() => {
    const unsubscribe = providersReceiver.subscribe((cells) => {
      setPreparedContent(cells);
    });

    setPreparedContent(providersReceiver.cellItems);

    return () => {
      unsubscribe();
    };
  }, [providersReceiver]);

  return preparedContent;
};
