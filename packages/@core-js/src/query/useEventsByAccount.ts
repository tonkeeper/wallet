import { AccountEvents } from '../TonAPI/TonAPIGenerated';
import { useInfiniteQuery, useQueryClient, InfiniteData } from 'react-query';
import { useTonAPI } from '../TonAPI';
import { useMemo, useState, useCallback } from 'react';

type Options<TData = unknown, TModifiedData = unknown> = {
  fetchMoreParams: (data: TData) => Record<string, any>;
  modify?: (data: TData) => TModifiedData;
  fetchMoreEnd?: (data: TData) => boolean;
};

export const useEventsByAccount = <TData = AccountEvents, TModifiedData = TData>(
  accountId: string,
  options: Options<TData, TModifiedData>,
) => {
  const { modify = (data) => data } = options;
  const queryKey = ['events', accountId];
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
    getNextPageParam: (data) =>
      data ? options.fetchMoreParams(data as TData) : undefined,
    queryKey: ['events', accountId],
    enabled: !!accountId,
    queryFn: async (lastPage) => {
      const { data, error } = await tonapi.accounts.getEventsByAccount({
        ...lastPage.pageParam,
        subject_only: true,
        accountId,
        limit: 50,
      });

      if (error) {
        throw error;
      }

      const result = data as TData;

      // console.warn(data.events[0].in_progress)

      if (options.fetchMoreEnd) {
        const isFetchMoreEnd = options.fetchMoreEnd(result);
        if (isFetchMoreEnd) {
          setFetchMoreEnd(true);
        }
      }


      data.events.map((event) => {
        queryClient.setQueryData(['account_event', event.event_id], event);
      });

      return data as TModifiedData; //modify((data as TData)) as TModifiedData;
    }
  });

  const flatData = useMemo(() => {
    return data?.pages.map((data) => data.events).flat();
  }, [data]);

  const modifed = useMemo(() => {
    return (flatData ? modify(flatData as TData) : flatData) as TModifiedData;
  }, [flatData]);

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
