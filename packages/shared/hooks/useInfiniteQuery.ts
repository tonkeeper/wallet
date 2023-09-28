import { useMemo, useState, useCallback } from 'react';
import { useValueRef } from '@tonkeeper/uikit';
import {
  useInfiniteQuery as useBaseInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueryClient,
  InfiniteData,
} from 'react-query';

type DataExtractorFn<TQueryFnData = unknown, T = unknown> = (data: TQueryFnData) => T;

type Options<TQueryFnData, TData = TQueryFnData, TExtarct = unknown> = {
  dataExtractor: DataExtractorFn<TQueryFnData, TExtarct>;
  queryFn: (params: any) => Promise<TQueryFnData>;
  getCursor: (lastPage: TData) => unknown;
};

type QueryKey = string | readonly unknown[];
export function useInfiniteQuery<
  TQueryFnData = unknown,
  TExtract = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
    'queryFn'
  > &
    Options<TData, TData, TExtract>,
) {
  const { queryFn, getCursor, dataExtractor, ...otherOptions } = options;
  const [fetchMoreEnd, setFetchMoreEnd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cursor = useValueRef<null | string>(null);
  const queryClient = useQueryClient();
  const {
    data: rawData,
    isLoading,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    refetch,
    ...rest
  } = useBaseInfiniteQuery({
    ...otherOptions,
    getNextPageParam: (data: any) => getCursor(data),
    queryFn: async (context) => {
      try {
        if (context.pageParam !== undefined) {
          cursor.setValue(context.pageParam);
        }

        const data = await queryFn(context.pageParam);
        if (options.dataExtractor) {
          const extractedData = options.dataExtractor(data);
          if ((extractedData as []).length < 1) {
            setFetchMoreEnd(true);
          }
        }

        cursor.setValue(null);
        return data as TQueryFnData;
      } catch (err) {
        cursor.setValue(null);
        throw err;
      }
    },
  });

  const data = useMemo(() => {
    return rawData?.pages.map(dataExtractor).flat(1);
  }, [rawData]);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch({ refetchPage: (_, index) => index === 0 });
      queryClient.setQueryData<InfiniteData<any>>(options.queryKey!, (data) => {
        return Object.assign(data ?? {}, {
          pages: data?.pages.filter((_, index) => index !== 1),
        }) as InfiniteData<any>;
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const fetchMore = useCallback(async () => {
    if (cursor.value === null) {
      await fetchNextPage();
    }
  }, []);

  return {
    ...rest,
    refreshing: isRefreshing,
    loading: isLoading,
    isFetchingNextPage,
    fetchMoreEnd,
    fetchMore,
    refresh,
    data,
  };
}
