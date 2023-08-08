import { useQueryClient } from 'react-query';
import { useTonAPI } from '../TonAPI';
import { useMemo } from 'react';

export const useTransaction = (transactionId: string, options: any = {}) => {
  const queryClient = useQueryClient();
  const tonapi = useTonAPI();

  return useMemo(() => {
    const ids = transactionId.split('_');
    const actionIndex = ids[1] ?? 0;
    const eventId = ids[0];

    const data = queryClient.getQueriesData(['account_event', eventId]);

    const event = data?.[0]?.[1] as any;

    if (event) {
      const action = event.actions[actionIndex];

      return options?.modify({ action, event });
    }

    return {};
  }, [transactionId]);
};
