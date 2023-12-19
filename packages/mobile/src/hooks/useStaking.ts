import { useStakingStore } from '$store';
import { walletSelector, walletWalletSelector } from '$store/wallet';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export const useStaking = () => {
  const wallet = useSelector(walletWalletSelector);
  const walletStore = useSelector(walletSelector);
  const address = walletStore?.address?.ton;

  const prevAddress = useRef(address);

  const { isConnected } = useNetInfo();
  const prevIsConnected = useRef(isConnected);

  const hasWallet = !!wallet;

  useEffect(() => {
    if (!hasWallet) {
      useStakingStore.getState().actions.reset();

      return;
    }

    useStakingStore.getState().actions.fetchPools(true);

    const timerId = setInterval(() => {
      useStakingStore.getState().actions.fetchPools(true);
    }, 10000);

    return () => {
      clearInterval(timerId);
    };
  }, [hasWallet]);

  useEffect(() => {
    if (
      address !== prevAddress.current ||
      (isConnected && prevIsConnected.current === false)
    ) {
      useStakingStore.getState().actions.fetchPools();
    }

    prevAddress.current = address;
    prevIsConnected.current = isConnected;
  }, [address, isConnected]);
};
