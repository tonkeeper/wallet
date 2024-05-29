import { formatAmount } from '$utils';
import React, { useMemo } from 'react';
import { CryptoCurrencies, CryptoCurrency } from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { Address } from '@tonkeeper/shared/Address';
import { formatter } from '@tonkeeper/shared/formatter';
import { TokenPrice, useGetTokenPrice } from '$hooks/useTokenPrice';
import { JettonIcon, TonIcon } from '@tonkeeper/uikit';
import { TokenType } from '$core/Send/Send.interface';
import { useTonInscriptions } from '@tonkeeper/shared/query/hooks/useTonInscriptions';
import { useBalancesState, useJettons, useStakingState } from '@tonkeeper/shared/hooks';

interface CurrencyToSend {
  decimals: number;
  balance: string;
  currencyTitle: string;
  Logo: JSX.Element;
  price?: TokenPrice;
  jettonWalletAddress?: string;
  jettonMaster?: string;
  isLiquidJetton?: boolean;
  liquidJettonPool?: any;
  type?: string;
}

export function useCurrencyToSend(
  currency: CryptoCurrency | string,
  tokenType: TokenType = TokenType.TON,
): CurrencyToSend {
  const balances = useBalancesState();
  const { jettonBalances } = useJettons();
  const inscriptions = useTonInscriptions();
  const stakingPools = useStakingState((s) => s.pools);

  const getTokenPrice = useGetTokenPrice();

  return useMemo<CurrencyToSend>(() => {
    switch (tokenType) {
      case TokenType.Jetton:
        const jetton = jettonBalances.find((item) =>
          Address.compare(item.jettonAddress, currency),
        ) as JettonBalanceModel | undefined;
        const price = getTokenPrice(currency, jetton!.balance);
        const decimals = jetton?.metadata?.decimals || 0;
        return {
          decimals,
          balance: formatAmount(jetton?.balance ?? '0', decimals),
          price,
          currencyTitle:
            jetton?.metadata?.symbol || Address.toShort(jetton?.jettonAddress),
          Logo: <JettonIcon size="large" uri={jetton?.metadata?.image || ''} />,
          jettonWalletAddress: jetton?.walletAddress,
          jettonMaster: jetton?.jettonAddress,
          isLiquidJetton:
            stakingPools.findIndex(
              (pool) =>
                pool.liquid_jetton_master ===
                Address.parse(jetton!.jettonAddress).toRaw(),
            ) !== -1,
        };
      case TokenType.TON:
        return {
          decimals: 9,
          balance: formatAmount(balances.ton, 9),
          currencyTitle: currency.toUpperCase(),
          Logo: (
            <TonIcon
              size="large"
              showDiamond
              locked={[
                CryptoCurrencies.TonLocked,
                CryptoCurrencies.TonRestricted,
              ].includes(currency as CryptoCurrencies)}
            />
          ),
          jettonWalletAddress: undefined,
          jettonMaster: undefined,
          isLiquidJetton: false,
          liquidJettonPool: null,
        };
      case TokenType.Inscription:
        const inscription = inscriptions.items?.find((item) => item.ticker === currency)!;
        return {
          Logo: <React.Fragment />,
          currencyTitle: inscription.ticker.toUpperCase(),
          decimals: inscription.decimals,
          balance: formatter.fromNano(inscription.balance, inscription.decimals),
          type: inscription.type,
        };
      default:
        return {
          decimals: 0,
          balance: '0',
          currencyTitle: '',
          Logo: <React.Fragment />,
        };
    }
  }, [
    tokenType,
    jettonBalances,
    getTokenPrice,
    currency,
    stakingPools,
    balances.ton,
    inscriptions.items,
  ]);
}
