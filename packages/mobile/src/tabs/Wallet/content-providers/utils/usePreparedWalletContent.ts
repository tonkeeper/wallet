import { useEffect, useState } from 'react';
import { CellItemToRender } from './types';
import { useInstance } from '$hooks/useInstance';
import { WalletContentReceiver } from './receiver';
import { tk } from '$wallet';

export const usePreparedWalletContent = () => {
  const providersReceiver = useInstance(() => new WalletContentReceiver());
  const [preparedContent, setPreparedContent] = useState<CellItemToRender[]>([]);

  useEffect(() => {
    return tk.onChangeWallet(() => {
      providersReceiver.setWallet(tk.wallet);
    });
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
