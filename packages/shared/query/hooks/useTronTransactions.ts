import { AccountEventsMapper } from '../../mappers/AccountEventsMapper';
import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import { tk } from '../../tonkeeper';
import { useMemo } from 'react';
import { AccountEvent, Action } from '@tonkeeper/core/src/TonAPI';
import { TronEvent } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';

export const useTronTransactions = () => {
  const query = useInfiniteQuery({
    queryFn: (fingerprint) => tk.wallet.transactions.fetchTron(fingerprint),
    dataExtractor: (data) => data.events,
    // initialData: tk.wallet.transactions.persisted,
    queryKey: tk.wallet.transactions.tronCacheKey,
    getCursor: (data) => data.fingerprint,
  });

  // TODO: move to transactions manager
  const modifed = useMemo(() => {
    const events = tronEventsToAccountEvent(query.data ?? []);
    return AccountEventsMapper(events, tk.wallet.address.ton.raw, true);
  }, [query.data, tk.wallet.address.ton.raw]);

  return {
    ...query,
    data: modifed,
  };
};

const tronEventsToAccountEvent = (tronEvents: TronEvent[]) => {
  const data = tronEvents.map((event, index) => {
    return {
      ...event,
      event_id: event.txHash+index,
      in_progress: event.inProgress,
      actions: event.actions.map((action) => ({
        ...action,
        simple_preview: {
          name: action.type,
          description: '',
        },
      })),
    };
  });

  return data;
};
