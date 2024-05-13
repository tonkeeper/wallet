import { RechargeMethods, RechargeMethodsTypeEnum } from '@tonkeeper/core/src/BatteryAPI';
import BigNumber from 'bignumber.js';
import { useRates, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { useCallback, useMemo } from 'react';
import { formatter } from '@tonkeeper/shared/formatter';
import { useJettonBalances } from '$hooks/useJettonBalances';
import { compareAddresses } from '$utils/address';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export function useRechargeMethod(
  rechargeMethod: ArrayElement<RechargeMethods['methods']>,
) {
  const currency = useWalletCurrency();

  const isTon = rechargeMethod.type === RechargeMethodsTypeEnum.Ton;
  const { enabled: jettonBalances } = useJettonBalances();

  const iconSource = useMemo(() => {
    if (isTon) {
      return require('@tonkeeper/uikit/assets/cryptoAssets/TON.png');
    }
    const jettonBalance = jettonBalances.find((jettonBalance) =>
      compareAddresses(jettonBalance.jettonAddress, rechargeMethod.jetton_master),
    )!;

    return { uri: jettonBalance.metadata.image };
  }, [isTon, jettonBalances, rechargeMethod.jetton_master]);

  const rates = useRates();

  const formattedTonFiatAmount = useCallback(
    (amount: number) => {
      return formatter.format(BigNumber(amount).multipliedBy(rates.ton.fiat), {
        currency,
      });
    },
    [currency, rates],
  );

  const fromTon = useCallback(
    (amount: number) => {
      const rate = isTon ? rates.ton : rates[rechargeMethod.jetton_master!];
      return new BigNumber(amount).div(rate.ton).toNumber();
    },
    [isTon, rates, rechargeMethod.jetton_master],
  );

  const minInputAmount = fromTon(0.1).toString();

  return useMemo(
    () => ({
      decimals: rechargeMethod.decimals,
      symbol: rechargeMethod.symbol,
      rate: rechargeMethod.rate,
      formattedTonFiatAmount,
      fromTon,
      isTon,
      minInputAmount,
      iconSource,
    }),
    [
      formattedTonFiatAmount,
      fromTon,
      isTon,
      rechargeMethod.decimals,
      rechargeMethod.rate,
      rechargeMethod.symbol,
      minInputAmount,
      iconSource,
    ],
  );
}
