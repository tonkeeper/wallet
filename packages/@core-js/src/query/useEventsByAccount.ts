import { useMemo } from 'react';
import { AccountEvents, GetEventsByAccountParams } from '../TonAPI/TonAPIGenerated';
import { useInfiniteQuery } from 'react-query';
import { useTonAPI } from '../TonAPI';

export const useEventsByAccount = (accountId: string) => {
  const tonapi = useTonAPI();

  const { data, error, isLoading, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<AccountEvents>({
    queryKey: ['events', accountId],
    // cacheTime: Infinity,
    getNextPageParam: ({ events }) => {
      if (events[events.length - 1]?.lt) {
        return {
          lastLt: events[events?.length - 1].lt,
        }
      }

      return {};      
    },
    queryFn: async ({ pageParam }) => {
      const { data, error } = await tonapi.accounts.getEventsByAccount({
        before_lt: pageParam?.lastLt ?? undefined,
        subject_only: true,
        accountId,
        limit: 50,
      });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const flatData = useMemo(() => {
    return data?.pages.map((data) => data.events).flat();
  }, [data]);

  return {
    fetchMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading: isLoading && !isFetchingNextPage,
    data: flatData,
    error,
  };
};
