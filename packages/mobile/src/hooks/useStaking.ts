import { DevFeature, useDevFeaturesToggle, useStakingStore } from '$store';
import { walletWalletSelector } from '$store/wallet';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useStaking = () => {
  const wallet = useSelector(walletWalletSelector);

  const { devFeatures } = useDevFeaturesToggle();

  const isStakingEnabled = devFeatures[DevFeature.Staking];

  const hasWallet = !!wallet;

  useEffect(() => {
    if (!hasWallet || !isStakingEnabled) {
      return;
    }

    useStakingStore.getState().actions.fetchPools(true);

    const timerId = setInterval(() => {
      useStakingStore.getState().actions.fetchPools(true);
    }, 3000);

    return () => {
      clearInterval(timerId);
    };
  }, [hasWallet, isStakingEnabled]);
};
