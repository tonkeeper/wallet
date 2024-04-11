import { useJettonBalances } from '$hooks/useJettonBalances';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { Steezy } from '$styles';
import { Highlight, Icon, PopupSelect, Spacer, Text, View } from '$uikit';
import { ns } from '$utils';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useHideableFormatter } from '$core/HideableAmount/useHideableFormatter';
import { DEFAULT_TOKEN_LOGO, JettonIcon, TonIcon } from '@tonkeeper/uikit';
import {
  CurrencyAdditionalParams,
  InscriptionAdditionalParams,
  TokenType,
} from '$core/Send/Send.interface';
import { useTonInscriptions } from '@tonkeeper/shared/query/hooks/useTonInscriptions';
import { formatter } from '@tonkeeper/shared/formatter';
import { useBalancesState } from '@tonkeeper/shared/hooks';

type CoinItem =
  | {
      tokenType: TokenType.TON;
      currency: string;
      balance: string;
      decimals: number;
      currencyAdditionalParams?: {};
    }
  | {
      tokenType: TokenType.Jetton;
      jetton: JettonBalanceModel;
      currency: string;
      balance: string;
      decimals: number;
      currencyAdditionalParams?: {};
    }
  | {
      tokenType: TokenType.Inscription;
      currency: string;
      currencyAdditionalParams: InscriptionAdditionalParams;
      decimals: number;
      balance: string;
    };

interface Props {
  currency: string;
  currencyTitle: string;
  onChangeCurrency: (
    currency: string,
    decimals: number,
    tokenType: TokenType,
    currencyAdditionalParams?: CurrencyAdditionalParams,
  ) => void;
}

const CoinDropdownComponent: FC<Props> = (props) => {
  const { currency, currencyTitle, onChangeCurrency } = props;

  const balances = useBalancesState();

  const { enabled: jettons } = useJettonBalances(true);
  const inscriptions = useTonInscriptions();
  const { format } = useHideableFormatter();

  const coins = useMemo((): CoinItem[] => {
    return [
      {
        tokenType: TokenType.TON,
        currency: CryptoCurrencies.Ton,
        balance: balances.ton,
        decimals: Decimals[CryptoCurrencies.Ton],
      },
      ...jettons.map((jetton): CoinItem => {
        return {
          tokenType: TokenType.Jetton,
          jetton: jetton,
          currency: jetton.jettonAddress,
          balance: jetton.balance,
          decimals: jetton.metadata.decimals,
        };
      }),
      ...inscriptions.items.map((inscription): CoinItem => {
        return {
          tokenType: TokenType.Inscription,
          currency: inscription.ticker,
          currencyAdditionalParams: {
            type: inscription.type,
          },
          decimals: inscription.decimals,
          balance: formatter.fromNano(inscription.balance, inscription.decimals),
        };
      }),
    ];
  }, [jettons, inscriptions.items, balances]);

  const selectedCoin = useMemo(
    () => coins.find((item) => item.currency === currency),
    [coins, currency],
  );

  const getTitle = useCallback((coin: CoinItem) => {
    if (coin.tokenType === TokenType.Jetton) {
      return coin.jetton.metadata.symbol ?? '';
    }

    return coin.currency.toUpperCase();
  }, []);

  if (coins.length === 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <PopupSelect
        items={coins}
        selected={selectedCoin}
        onChange={(item) =>
          onChangeCurrency(
            item.currency,
            item.decimals,
            item.tokenType,
            item.currencyAdditionalParams,
          )
        }
        keyExtractor={(item) => item.currency}
        width={ns(220)}
        maxHeight={ns(216)}
        asFullWindowOverlay
        renderItem={(item) => (
          <>
            {item.tokenType === TokenType.Jetton ? (
              <JettonIcon size="xsmall" uri={item.jetton.metadata.image!} />
            ) : null}
            {item.tokenType === TokenType.Inscription ? (
              <JettonIcon size="xsmall" uri={DEFAULT_TOKEN_LOGO} />
            ) : null}
            {item.tokenType === TokenType.TON ? (
              <TonIcon
                size="xsmall"
                locked={[
                  CryptoCurrencies.TonLocked,
                  CryptoCurrencies.TonRestricted,
                ].includes(item.currency as CryptoCurrencies)}
                showDiamond
              />
            ) : null}
            <Spacer x={8} />
            <Text numberOfLines={1} style={{ width: ns(156) }}>
              <Text variant="label1">{getTitle(item)}</Text>
              {'  '}
              <Text color="foregroundSecondary">{format(item.balance)}</Text>
            </Text>
          </>
        )}
        anchor="top-center"
        top={ns(40) + ns(8)}
      >
        <Highlight background="backgroundQuaternary" useRNGHComponent>
          <View style={styles.content}>
            <Text variant="label1">{currencyTitle}</Text>
            <View style={styles.chevron}>
              <Icon name="ic-chevron-down-16" color="iconSecondary" />
            </View>
          </View>
        </Highlight>
      </PopupSelect>
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    borderRadius: 24,
    backgroundColor: colors.buttonTertiaryBackground,
    overflow: 'hidden',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chevron: {
    marginLeft: 6,
    marginRight: -4,
  },
}));

export const CoinDropdown = memo(CoinDropdownComponent);
