import { useInfiniteQuery, useQueryClient, InfiniteData } from 'react-query';
import { AccountEvents, useTonAPI } from '@tonkeeper/core/src/TonAPI';
import { useMemo, useState, useCallback } from 'react';
import { tonkeeper } from '../../tonkeeper';
import { AccountEventsMapper } from '../../mappers/AccountEventsMapper';

type Options<TData = unknown, TModifiedData = unknown> = {
  // fetchMoreParams: (data: TData) => Record<string, any>;
  modify?: (data: TData) => TModifiedData;
  fetchMoreEnd?: (data: TData) => boolean;
};

export const useAccountTransactions = <TData = AccountEvents, TModifiedData = TData>(
  walletAddress: string,
  options: Options<TData, TModifiedData>,
) => {
  const queryKey = ['events', '1'];
  const [fetchMoreEnd, setFetchMoreEnd] = useState(false);
  const queryClient = useQueryClient();
  const tonapi = useTonAPI();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<TModifiedData>({
    getNextPageParam: (data) => data?.next_from,
    queryKey: ['events', '1'],
    queryFn: async (lastPage) => {
      const events = await tonkeeper.transactions.fetch(lastPage.pageParam);
      const result = events as TData;

      if (options.fetchMoreEnd) {
        const isFetchMoreEnd = options.fetchMoreEnd(result);
        if (isFetchMoreEnd) {
          setFetchMoreEnd(true);
        }
      }

      return result as TModifiedData; //modify((data as TData)) as TModifiedData;
    }
  });

  const flatData = useMemo(() => {
    return data?.pages.map((data) => data?.events).flat(1);
  }, [data]);

  const modifed = useMemo(() => {

    return AccountEventsMapper(flatData ?? [] as TData, walletAddress)
    // return (flatData ? modify(flatData as TData) : flatData) as TModifiedData;
  }, [flatData, walletAddress]);

  const fetchMore = useCallback(() => {
    if (!isFetchingNextPage && !fetchMoreEnd) {
      return fetchNextPage();
    }
  }, [fetchNextPage, fetchMoreEnd, isFetchingNextPage]);

  const refresh = useCallback(async () => {
    await refetch({ refetchPage: (_, index) => index === 0 });
    queryClient.setQueryData<InfiniteData<any>>(queryKey, (data) => {
      return Object.assign(data ?? {}, {
        pages: data?.pages.filter((_, index) => index !== 1),
      }) as InfiniteData<any>;
    });
  }, [queryClient]);

  return {
    loadingMore: isFetchingNextPage,
    refreshing: isRefetching,
    loading: isLoading,
    data: modifed,
    fetchMoreEnd,
    fetchMore,
    refresh,
    error,
  };
};
