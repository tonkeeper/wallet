import { JettonBalanceModel } from '$store/models';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { walletAddressSelector } from '$store/wallet';
import { useJettonEventsStore } from '$store/zustand/jettonEvents';

export function useJettonEvents(address: JettonBalanceModel['walletAddress']) {
  const tonAddress = useSelector(walletAddressSelector).ton;
  const {
    events = {},
    isLoading = false,
    isRefreshing = false,
  } = useJettonEventsStore((state) => state.jettons[address] ?? {});

  const { fetchJettonEvents } = useJettonEventsStore((state) => state.actions);

  const retrieveJettonEvents = useCallback(
    async (isRefresh?: boolean) => {
      fetchJettonEvents(tonAddress, address, isRefresh);
    },
    [fetchJettonEvents, tonAddress, address],
  );

  const refreshJettonEvents = useCallback(async () => {
    retrieveJettonEvents(true);
  }, [retrieveJettonEvents]);

  useEffect(() => {
    retrieveJettonEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return useMemo(
    () => ({ events, isLoading, isRefreshing, refreshJettonEvents }),
    [refreshJettonEvents, isLoading, isRefreshing, events],
  );
}
