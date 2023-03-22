import { AppStackRouteNames, openRequireWalletModal } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';
import { stakingFormatter } from '$utils/formatter';
import { PoolInfo, AccountStakingInfo } from '@tonkeeper/core';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { useFiatValue } from './useFiatValue';
import { useTranslator } from './useTranslator';
import { useNavigation } from '$libs/navigation';
import { StakingTransactionType } from '$core/StakingSend/types';
import { useWallet } from './useWallet';

export interface PoolDetailsItem {
  label: string;
  value: string;
}

export const usePoolInfo = (pool: PoolInfo, poolStakingInfo?: AccountStakingInfo) => {
  const t = useTranslator();

  const nav = useNavigation();

  const wallet = useWallet();

  const balance = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.amount ?? '0'),
  );
  const pendingDeposit = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.pendingDeposit ?? '0'),
  );
  const pendingWithdraw = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.pendingWithdraw ?? '0'),
  );
  const readyWithdraw = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.readyWithdraw ?? '0'),
  );

  const hasDeposit = new BigNumber(balance.amount).isGreaterThan(0);
  const hasPendingDeposit = new BigNumber(pendingDeposit.amount).isGreaterThan(0);
  const hasPendingWithdraw = new BigNumber(pendingWithdraw.amount).isGreaterThan(0);
  const hasReadyWithdraw = new BigNumber(readyWithdraw.amount).isGreaterThan(0);

  const frequency = Math.round((pool.cycleEnd - pool.cycleStart) / 3600);
  const apy = pool.apy.toFixed(2);
  const minDeposit = stakingFormatter.fromNano(pool.minStake);

  const handleTopUpPress = useCallback(() => {
    if (wallet) {
      nav.push(AppStackRouteNames.StakingSend, {
        poolAddress: pool.address,
        transactionType: StakingTransactionType.DEPOSIT,
      });
    } else {
      openRequireWalletModal();
    }
  }, [nav, pool.address, wallet]);

  const handleWithdrawalPress = useCallback(() => {
    nav.push(AppStackRouteNames.StakingSend, {
      poolAddress: pool.address,
      transactionType: StakingTransactionType.WITHDRAWAL,
    });
  }, [nav, pool.address]);

  const handleConfirmWithdrawalPress = useCallback(() => {
    nav.push(AppStackRouteNames.StakingSend, {
      poolAddress: pool.address,
      transactionType: StakingTransactionType.WITHDRAWAL_CONFIRM,
    });
  }, [nav, pool.address]);

  const infoRows = useMemo(() => {
    const rows: PoolDetailsItem[] = [];

    if (apy) {
      rows.push({
        label: t('staking.details.apy.label'),
        value: t('staking.details.apy.value', { value: apy }),
      });
    }

    if (frequency) {
      rows.push({
        label: t('staking.details.frequency.label'),
        value: t('staking.details.frequency.value', { value: frequency }),
      });
    }

    if (minDeposit) {
      rows.push({
        label: t('staking.details.min_deposit.label'),
        value: t('staking.details.min_deposit.value', { value: minDeposit }),
      });
    }

    return rows;
  }, [apy, frequency, minDeposit, t]);

  return {
    infoRows,
    balance,
    pendingDeposit,
    pendingWithdraw,
    readyWithdraw,
    hasDeposit,
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    handleTopUpPress,
    handleWithdrawalPress,
    handleConfirmWithdrawalPress,
  };
};
