import { formatAmount } from '$utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { CurrencyIcon } from '$uikit';
import { jettonsSelector } from '$store/jettons';
import { JettonBalanceModel } from '$store/models';
import { useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';
import { Address } from '@tonkeeper/shared/Address';
import { useTronBalances } from '@tonkeeper/shared/query/hooks/useTronBalances';
import { formatter } from '@tonkeeper/shared/formatter';
import { useGetTokenPrice } from './useTokenPrice';

export function useCurrencyToSend(
  currency: CryptoCurrency | string,
  isJetton?: boolean,
  logoSize: number = 32,
  isUSDT?: boolean,
) {
  const { balances } = useSelector(walletSelector);
  const { jettonBalances } = useSelector(jettonsSelector);
  const tronBalances = useTronBalances();

  const stakingPools = useStakingStore((s) => s.pools, shallow);

  const jetton = useMemo(() => {
    return (isJetton &&
      jettonBalances.find(
        (item) => item.jettonAddress === currency,
      )) as JettonBalanceModel;
  }, [currency, isJetton, jettonBalances]);

  const liquidJettonPool = useMemo(
    () =>
      jetton
        ? stakingPools.find(
            (pool) => pool.liquid_jetton_master === Address.parse(jetton.jettonAddress).toRaw(),
          )
        : undefined,
    [jetton, stakingPools],
  );

  const decimals = useMemo(() => {
    if (isUSDT) {
      return;
    }

    return isJetton ? jetton?.metadata?.decimals || 0 : Decimals[currency];
  }, [currency, isJetton, jetton, isUSDT]);

  const Logo = useMemo(
    () => (
      <CurrencyIcon
        isJetton={!liquidJettonPool && isJetton}
        uri={jetton?.metadata?.image}
        currency={liquidJettonPool ? CryptoCurrencies.Ton : (currency as CryptoCurrency)}
        size={logoSize}
      />
    ),
    [currency, isJetton, jetton?.metadata?.image, liquidJettonPool, logoSize],
  );

  const getTokenPrice = useGetTokenPrice();

  const currencyToSend = useMemo(() => {
    if (isJetton) {
      const price = getTokenPrice(currency, jetton.balance);

      if (liquidJettonPool) {
        return {
          decimals: Decimals[CryptoCurrencies.Ton],
          balance: price.totalTon,
          price,
          currencyTitle: 'TON',
          Logo,
          jettonWalletAddress: jetton?.walletAddress,
          isLiquidJetton: !!liquidJettonPool,
          liquidJettonPool,
        };
      }

      return {
        decimals: jetton?.metadata?.decimals || 0,
        balance: formatAmount(jetton?.balance, decimals),
        price,
        currencyTitle: jetton?.metadata?.symbol || Address.toShort(jetton?.jettonAddress),
        Logo,
        jettonWalletAddress: jetton?.walletAddress,
        isLiquidJetton: false,
      };
    } else if (isUSDT) {
      const usdt = tronBalances.data?.[0];

      console.log(usdt);
      return {
        trcToken: usdt!.token.address,
        decimals: usdt!.token.decimals ?? 6,
        balance: formatter.fromNano(usdt!.weiAmount, usdt!.token.decimals),
        currencyTitle: usdt!.token.symbol,
        jettonWalletAddress: undefined,
        isLiquidJetton: false,
        Logo: (
          <CurrencyIcon
            isJetton={false}
            uri={usdt!.token.image}
            currency={CryptoCurrencies.Usdt}
            size={logoSize}
          />
        ),
      };
    } else {
      return {
        decimals: Decimals[currency],
        balance: formatAmount(balances[currency], decimals),
        currencyTitle: currency.toUpperCase(),
        Logo,
        jettonWalletAddress: undefined,
        isLiquidJetton: false,
        liquidJettonPool: null,
      };
    }
  }, [
    isJetton,
    getTokenPrice,
    currency,
    jetton.balance,
    jetton?.metadata?.decimals,
    jetton?.metadata?.symbol,
    jetton?.jettonAddress,
    jetton?.walletAddress,
    liquidJettonPool,
    decimals,
    Logo,
    balances,
  ]);

  return currencyToSend;
}
