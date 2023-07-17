import { AppStackRouteNames, openRequireWalletModal } from '$navigation';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatter, stakingFormatter } from '$utils/formatter';
import { PoolInfo, AccountStakingInfo } from '@tonkeeper/core/src/legacy';
import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { useFiatValue } from './useFiatValue';
import { useTranslator } from './useTranslator';
import { useNavigation } from '$libs/navigation';
import { StakingTransactionType } from '$core/StakingSend/types';
import { useWallet } from './useWallet';
import { Address, Ton } from '$libs/Ton';
import { useCopyText } from './useCopyText';
import { useSelector } from 'react-redux';
import { jettonsBalancesSelector } from '$store/jettons';

export interface PoolDetailsItem {
  label: string;
  value: string;
  onPress?: () => void;
}

export const usePoolInfo = (pool: PoolInfo, poolStakingInfo?: AccountStakingInfo) => {
  const t = useTranslator();

  const copyText = useCopyText();

  const nav = useNavigation();

  const wallet = useWallet();

  const jettonBalances = useSelector(jettonsBalancesSelector);

  const stakingJetton = useMemo(() => {
    if (pool.implementation === 'liquidTF' && pool.liquidJettonMaster) {
      const jetton = jettonBalances.find(
        (item) =>
          Ton.formatAddress(item.jettonAddress, { raw: true }) ===
          pool.liquidJettonMaster,
      );

      return jetton;
    }

    return undefined;
  }, [jettonBalances, pool.implementation, pool.liquidJettonMaster]);

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
      transactionType:
        pool.implementation === 'tf'
          ? StakingTransactionType.WITHDRAWAL_CONFIRM
          : StakingTransactionType.WITHDRAWAL,
    });
  }, [nav, pool.address, pool.implementation]);

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
        value: t('staking.details.frequency.value', { count: frequency }),
      });
    }

    const address = new Address(pool.address);

    rows.push({
      label: t('staking.details.pool_address.label'),
      value: address.format({ cut: true }),
      onPress: () => {
        copyText(address.format(), t('address_copied'));
      },
    });

    if (minDeposit) {
      rows.push({
        label: t('staking.details.min_deposit.label'),
        value: t('staking.details.min_deposit.value', {
          value: formatter.format(minDeposit, { decimals: 0 }),
        }),
      });
    }

    return rows;
  }, [apy, copyText, frequency, minDeposit, pool.address, t]);

  return {
    infoRows,
    stakingJetton,
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
