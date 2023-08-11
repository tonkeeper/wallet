import { AccountEventsMapper } from '../../mappers/AccountEventsMapper';
import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';
import { useMemo } from 'react';
import { AccountEvent, Action } from '@tonkeeper/core/src/TonAPI';

export const useTonTransactions = () => {
  const query = useInfiniteQuery({
    queryFn: (next_from) => tk.wallet.transactions.fetch(next_from),
    dataExtractor: (data) => data.events,
    initialData: tk.wallet.transactions.persisted,
    queryKey: tk.wallet.transactions.cacheKey,
    getCursor: (data) => data.next_from,
  });

  // TODO: move to transactions manager
  const modifed = useMemo(() => {
    const data = filterOnlyTonEvents(query.data ?? []);
    return AccountEventsMapper(data, tk.wallet.address.raw);
  }, [query.data, tk.wallet.address.raw]);

  return {
    ...query,
    data: modifed,
  };
};

const seeIfTonTransfer = (action: Action) => {
  if (action.type === 'TonTransfer') {
    return true;
  } else if (action.type === 'ContractDeploy') {
    if (action.ContractDeploy?.interfaces?.includes('wallet')) {
      return true;
    }
  }
  return false;
};

export const filterOnlyTonEvents = (data: AccountEvent[]) => {
  return data.reduce<AccountEvent[]>((acc, event) => {
    const tonTransferEvent = event.actions.every(seeIfTonTransfer);
    if (tonTransferEvent) {
      acc.push(event);
    }

    return acc;
  }, []);
};
