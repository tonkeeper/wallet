import { useEffect, useState } from 'react';
import { CellItemToRender } from './types';
import { useInstance } from '$hooks/useInstance';
import { WalletContentReceiver } from './receiver';
import { tk } from '$wallet';

export const usePreparedWalletContent = (isEditableMode: boolean = false) => {
  const providersReceiver = useInstance(() => new WalletContentReceiver(isEditableMode));
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
