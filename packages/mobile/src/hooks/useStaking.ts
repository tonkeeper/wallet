import { useStakingStore } from '$store';
import { walletSelector, walletWalletSelector } from '$store/wallet';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export const useStaking = () => {
  const wallet = useSelector(walletWalletSelector);
  const walletStore = useSelector(walletSelector);
  const address = walletStore?.address?.ton;

  const prevAddress = useRef(address);

  const hasWallet = !!wallet;

  useEffect(() => {
    if (!hasWallet) {
      useStakingStore.getState().actions.reset();

      return;
    }

    useStakingStore.getState().actions.fetchPools(true);

    const timerId = setInterval(() => {
      useStakingStore.getState().actions.fetchPools(true);
    }, 3000);

    return () => {
      clearInterval(timerId);
    };
  }, [hasWallet]);

  useEffect(() => {
    if (address !== prevAddress.current) {
      useStakingStore.getState().actions.reset();
      useStakingStore.getState().actions.fetchPools();
    }

    prevAddress.current = address;
  }, [address]);
};
