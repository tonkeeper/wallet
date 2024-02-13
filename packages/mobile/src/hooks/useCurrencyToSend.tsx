import { formatAmount } from '$utils';
import React, { useMemo } from 'react';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { Address } from '@tonkeeper/shared/Address';
import { formatter } from '@tonkeeper/shared/formatter';
import { useGetTokenPrice } from './useTokenPrice';
import { JettonIcon, TonIcon } from '@tonkeeper/uikit';
import { TokenType } from '$core/Send/Send.interface';
import { useTonInscriptions } from '@tonkeeper/shared/query/hooks/useTonInscriptions';
import { useBalancesState, useJettons, useStakingState } from '@tonkeeper/shared/hooks';

export function useCurrencyToSend(
  currency: CryptoCurrency | string,
  tokenType: TokenType = TokenType.TON,
) {
  const balances = useBalancesState();
  const { jettonBalances } = useJettons();
  const inscriptions = useTonInscriptions();
  const stakingPools = useStakingState((s) => s.pools);

  const jetton = useMemo(() => {
    return (tokenType === TokenType.Jetton &&
      jettonBalances.find((item) => Address.compare(item.jettonAddress, currency))) as
      | JettonBalanceModel
      | undefined;
  }, [currency, tokenType, jettonBalances]);

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
    return tokenType === TokenType.Jetton
      ? jetton?.metadata?.decimals || 0
      : Decimals[currency];
  }, [currency, tokenType, jetton]);

  const Logo = useMemo(
    () =>
      tokenType === TokenType.Jetton ? (
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
    [currency, tokenType, jetton],
  );

  const getTokenPrice = useGetTokenPrice();

  const currencyToSend = useMemo(() => {
    switch (tokenType) {
      case TokenType.Jetton:
        const price = getTokenPrice(currency, jetton?.balance);

        return {
          decimals: jetton?.metadata?.decimals || 0,
          balance: formatAmount(jetton?.balance ?? '0', decimals),
          price,
          currencyTitle:
            jetton?.metadata?.symbol || Address.toShort(jetton?.jettonAddress),
          Logo,
          jettonWalletAddress: jetton?.walletAddress,
          isLiquidJetton: !!liquidJettonPool,
        };
      // case TokenType.USDT:
      //   const usdt = tronBalances.data?.[0];

      //   console.log(usdt);
      //   return {
      //     trcToken: usdt!.token.address,
      //     decimals: usdt!.token.decimals ?? 6,
      //     balance: formatter.fromNano(usdt!.weiAmount, usdt!.token.decimals),
      //     currencyTitle: usdt!.token.symbol,
      //     jettonWalletAddress: undefined,
      //     isLiquidJetton: false,
      //     Logo: null,
      //   };
      case TokenType.TON:
        return {
          decimals: Decimals[currency],
          balance: formatAmount(balances.ton, decimals),
          currencyTitle: currency.toUpperCase(),
          Logo,
          jettonWalletAddress: undefined,
          isLiquidJetton: false,
          liquidJettonPool: null,
        };
      case TokenType.Inscription:
        const inscription = inscriptions.items?.find((item) => item.ticker === currency)!;
        return {
          currencyTitle: inscription.ticker.toUpperCase(),
          decimals: inscription.decimals,
          balance: formatter.fromNano(inscription.balance, inscription.decimals),
          type: inscription.type,
        };
    }
  }, [
    tokenType,
    getTokenPrice,
    currency,
    jetton,
    decimals,
    Logo,
    liquidJettonPool,
    balances,
    inscriptions.items,
  ]);

  return currencyToSend;
}
