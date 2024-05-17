import { RechargeMethodsTypeEnum } from '@tonkeeper/core/src/BatteryAPI';
import BigNumber from 'bignumber.js';
import { useRates, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { useCallback, useMemo } from 'react';
import { formatter } from '@tonkeeper/shared/formatter';
import { tk } from '$wallet';
import { compareAddresses } from '$utils/address';
import { RechargeMethod } from '$core/BatterySend/types';
import { ImageProps } from 'react-native';
import { config } from '$config';

export interface IRechargeMethod extends RechargeMethod {
  formattedTonFiatAmount: (amount: number | string) => string;
  fromTon: (amount: number | string) => number;
  isTon: boolean;
  minInputAmount: string;
  maxInputAmount: string;
  iconSource: ImageProps['source'];
  balance: string;
  isGreaterThanBalance: (amount: string) => () => void;
}

export function useRechargeMethod(rechargeMethod: RechargeMethod): IRechargeMethod {
  const currency = useWalletCurrency();

  const isTon = rechargeMethod.type === RechargeMethodsTypeEnum.Ton;

  const iconSource = useMemo(() => {
    if (isTon) {
      return require('@tonkeeper/uikit/assets/cryptoAssets/TON.png');
    }
    return { uri: rechargeMethod.image };
  }, [isTon, rechargeMethod.image]);

  const rates = useRates();

  const fromTon = useCallback(
    (amount: number | string) => {
      return new BigNumber(amount)
        .div(rechargeMethod.rate)
        .decimalPlaces(rechargeMethod.decimals)
        .toNumber();
    },
    [rechargeMethod.decimals, rechargeMethod.rate],
  );

  const formattedTonFiatAmount = useCallback(
    (amount: number | string) => {
      const rate = isTon ? rates.ton : rates[rechargeMethod.jetton_master!];
      return formatter.format(BigNumber(fromTon(amount)).multipliedBy(rate.fiat), {
        currency,
      });
    },
    [currency, fromTon, isTon, rates, rechargeMethod.jetton_master],
  );

  const balance = useMemo(() => {
    if (isTon) {
      return tk.wallet.balances.state.data.ton;
    }
    return tk.wallet.jettons.state.data.jettonBalances.find((jetton) =>
      compareAddresses(rechargeMethod.jetton_master, jetton.jettonAddress),
    )?.balance!;
  }, [isTon, rechargeMethod.jetton_master]);

  const isGreaterThanBalance = useCallback(
    (amount: string) => () => {
      return new BigNumber(amount).isGreaterThan(balance);
    },
    [balance],
  );

  const minInputAmount = fromTon(config.get('batteryReservedAmount')).toString();
  const maxInputAmount = fromTon(config.get('batteryMaxInputAmount')).toString();

  return useMemo(
    () => ({
      ...rechargeMethod,
      formattedTonFiatAmount,
      fromTon,
      isTon,
      minInputAmount,
      maxInputAmount,
      iconSource,
      balance,
      isGreaterThanBalance,
    }),
    [
      rechargeMethod,
      formattedTonFiatAmount,
      fromTon,
      isTon,
      minInputAmount,
      maxInputAmount,
      iconSource,
      balance,
      isGreaterThanBalance,
    ],
  );
}
