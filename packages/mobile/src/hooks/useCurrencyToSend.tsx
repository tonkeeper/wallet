import { formatAmount } from '$utils';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { jettonsSelector } from '$store/jettons';
import { JettonBalanceModel } from '$store/models';
import { useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';
import { Address } from '@tonkeeper/shared/Address';
import { useTronBalances } from '@tonkeeper/shared/query/hooks/useTronBalances';
import { formatter } from '@tonkeeper/shared/formatter';
import { useGetTokenPrice } from './useTokenPrice';
import { JettonIcon, TonIcon } from '@tonkeeper/uikit';

export function useCurrencyToSend(
  currency: CryptoCurrency | string,
  isJetton?: boolean,
  isUSDT?: boolean,
) {
  const { balances } = useSelector(walletSelector);
  const { jettonBalances } = useSelector(jettonsSelector);
  const tronBalances = useTronBalances();

  const stakingPools = useStakingStore((s) => s.pools, shallow);

  const jetton = useMemo(() => {
    return (isJetton &&
      jettonBalances.find((item) => item.jettonAddress === currency)) as
      | JettonBalanceModel
      | undefined;
  }, [currency, isJetton, jettonBalances]);

  const liquidJettonPool = useMemo(
    () =>
      jetton
        ? stakingPools.find(
            (pool) =>
              pool.liquid_jetton_master === Address.parse(jetton.jettonAddress).toRaw(),
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
    () =>
      isJetton ? (
        <JettonIcon size="large" uri={jetton?.metadata?.image || ''} />
      ) : (
        <TonIcon
          size="large"
          showDiamond
          locked={[CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].includes(
            currency as CryptoCurrencies,
          )}
        />
      ),
    [currency, isJetton, jetton],
  );

  const getTokenPrice = useGetTokenPrice();

  const currencyToSend = useMemo(() => {
    if (isJetton) {
      const price = getTokenPrice(currency, jetton?.balance);

      return {
        decimals: jetton?.metadata?.decimals || 0,
        balance: formatAmount(jetton?.balance ?? '0', decimals),
        price,
        currencyTitle: jetton?.metadata?.symbol || Address.toShort(jetton?.jettonAddress),
        Logo,
        jettonWalletAddress: jetton?.walletAddress,
        isLiquidJetton: !!liquidJettonPool,
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
        Logo: null,
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
    isUSDT,
    getTokenPrice,
    currency,
    jetton,
    liquidJettonPool,
    decimals,
    Logo,
    tronBalances.data,
    balances,
  ]);

  return currencyToSend;
}
