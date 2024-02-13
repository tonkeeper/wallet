import { AppStackRouteNames } from '$navigation';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatter, stakingFormatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { useFiatValue } from './useFiatValue';
import { useNavigation } from '@tonkeeper/router';
import { StakingTransactionType } from '$core/StakingSend/types';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/shared/Address';
import { TagType } from '$uikit/Tag';
import { Toast } from '$store';
import {
  AccountStakingInfo,
  PoolInfo,
  PoolImplementationType,
} from '@tonkeeper/core/src/TonAPI';
import { useGetTokenPrice } from './useTokenPrice';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { useCurrencyToSend } from './useCurrencyToSend';
import { Ton } from '$libs/Ton';
import { useJettons, useStakingState, useWallet } from '@tonkeeper/shared/hooks';

export interface PoolDetailsItem {
  label: string;
  value: string;
  tags?: { title: string; type?: TagType }[];
  onPress?: () => void;
}

export const usePoolInfo = (pool: PoolInfo, poolStakingInfo?: AccountStakingInfo) => {
  const nav = useNavigation();

  const wallet = useWallet();

  const { balance: tonBalance } = useCurrencyToSend(CryptoCurrencies.Ton);

  const { jettonBalances } = useJettons();

  const highestApyPool = useStakingState((s) => s.highestApyPool);

  const getTokenPrice = useGetTokenPrice();

  const stakingJetton = useMemo(() => {
    if (
      pool.implementation === PoolImplementationType.LiquidTF &&
      pool.liquid_jetton_master
    ) {
      const jetton = jettonBalances.find(
        (item) => Address.parse(item.jettonAddress).toRaw() === pool.liquid_jetton_master,
      );

      return jetton;
    }

    return undefined;
  }, [jettonBalances, pool.implementation, pool.liquid_jetton_master]);

  const stakingJettonMetadata = useStakingState(
    (s) =>
      pool.liquid_jetton_master
        ? {
            ...s.stakingJettons[pool.liquid_jetton_master],
            price: getTokenPrice(
              Address.parse(pool.liquid_jetton_master).toFriendly(),
              stakingJetton?.balance || '0',
            ),
          }
        : null,
    [pool.liquid_jetton_master, stakingJetton],
  );

  const currency = stakingJetton ? stakingJetton.jettonAddress : CryptoCurrencies.Ton;

  const balance = useFiatValue(
    currency as CryptoCurrencies,
    stakingJetton
      ? stakingJetton.balance
      : stakingFormatter.fromNano(poolStakingInfo?.amount ?? '0'),
    stakingJetton ? stakingJetton.metadata.decimals : Decimals[CryptoCurrencies.Ton],
    !!stakingJetton,
    stakingJetton ? stakingJetton.metadata.symbol! : 'TON',
  );

  const pendingDeposit = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.pending_deposit ?? '0'),
  );
  const pendingWithdraw = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.pending_withdraw ?? '0'),
  );
  const readyWithdraw = useFiatValue(
    CryptoCurrencies.Ton,
    stakingFormatter.fromNano(poolStakingInfo?.ready_withdraw ?? '0'),
  );

  const hasDeposit = new BigNumber(
    stakingJetton ? stakingJetton.balance : balance.amount,
  ).isGreaterThan(0);
  const hasPendingDeposit = new BigNumber(pendingDeposit.amount).isGreaterThan(0);
  const hasPendingWithdraw = new BigNumber(pendingWithdraw.amount).isGreaterThan(0);
  const hasReadyWithdraw = new BigNumber(readyWithdraw.amount).isGreaterThan(0);

  const isWithdrawDisabled =
    hasDeposit &&
    new BigNumber(balance.amount)
      .minus(new BigNumber(pendingWithdraw.amount))
      .isEqualTo(0);

  // const frequency = Math.round((pool.cycle_end - pool.cycle_start) / 3600);
  const apy = pool.apy.toFixed(2);
  const minDeposit = stakingFormatter.fromNano(pool.min_stake);

  const handleTopUpPress = useCallback(() => {
    if (wallet) {
      const canDeposit = new BigNumber(tonBalance).isGreaterThanOrEqualTo(2.2);
      if (pool.implementation === PoolImplementationType.LiquidTF && !canDeposit) {
        return openInsufficientFundsModal({
          totalAmount: Ton.toNano(2.2),
          balance: Ton.toNano(tonBalance),
          isStakingDeposit: true,
        });
      }

      nav.push(AppStackRouteNames.StakingSend, {
        poolAddress: pool.address,
        transactionType: StakingTransactionType.DEPOSIT,
      });
    } else {
      openRequireWalletModal();
    }
  }, [nav, pool.address, pool.implementation, tonBalance, wallet]);

  const handleWithdrawalPress = useCallback(() => {
    if (!hasDeposit) {
      Toast.show(t('staking.no_funds'));
      return;
    }

    nav.push(AppStackRouteNames.StakingSend, {
      poolAddress: pool.address,
      transactionType:
        pool.implementation === PoolImplementationType.Tf
          ? StakingTransactionType.WITHDRAWAL_CONFIRM
          : StakingTransactionType.WITHDRAWAL,
    });
  }, [hasDeposit, nav, pool.address, pool.implementation]);

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
        tags:
          highestApyPool?.apy === pool.apy
            ? [{ title: t('staking.details.apy.highest_tag'), type: 'positive' }]
            : [],
      });
    }

    if (minDeposit) {
      rows.push({
        label: t('staking.details.min_deposit.label'),
        value: t('staking.details.min_deposit.value', {
          value: formatter.format(minDeposit, { decimals: 0 }),
        }),
      });
    }

    // if (frequency) {
    //   rows.push({
    //     label: t('staking.details.frequency.label'),
    //     value: t('staking.details.frequency.value', { count: frequency }),
    //   });
    // }

    return rows;
  }, [apy, highestApyPool, minDeposit, pool.apy]);

  return {
    infoRows,
    stakingJetton,
    stakingJettonMetadata,
    balance,
    pendingDeposit,
    pendingWithdraw,
    readyWithdraw,
    hasDeposit,
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    isWithdrawDisabled,
    handleTopUpPress,
    handleWithdrawalPress,
    handleConfirmWithdrawalPress,
  };
};
