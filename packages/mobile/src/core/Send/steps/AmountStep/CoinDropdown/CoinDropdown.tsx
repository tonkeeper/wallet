import { useJettonBalances } from '$hooks';
import { AmountInputRef } from '$shared/components';
import {
  CryptoCurrencies,
  CryptoCurrency,
  Decimals,
  SecondaryCryptoCurrencies,
} from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { walletSelector } from '$store/wallet';
import { Steezy } from '$styles';
import { CurrencyIcon, Highlight, Icon, PopupSelect, Spacer, Text, View } from '$uikit';
import { ns } from '$utils';
import { formatter } from '$utils/formatter';
import React, { FC, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

type CoinItem =
  | { isJetton: false; currency: string; balance: string; decimals: number }
  | {
      isJetton: true;
      jetton: JettonBalanceModel;
      currency: string;
      balance: string;
      decimals: number;
    };

interface Props {
  currency: string;
  currencyTitle: string;
  onChangeCurrency: (currency: string, decimals: number, isJetton: boolean) => void;
}

const CoinDropdownComponent: FC<Props> = (props) => {
  const { currency, currencyTitle, onChangeCurrency } = props;

  const { currencies, balances } = useSelector(walletSelector);

  const { enabled: jettons } = useJettonBalances();

  const coins = useMemo((): CoinItem[] => {
    const list = [
      CryptoCurrencies.Ton,
      ...SecondaryCryptoCurrencies.filter((item) => {
        if (item === CryptoCurrencies.Ton) {
          return false;
        }

        if (+balances[item] > 0) {
          return true;
        }

        return currencies.indexOf(item) > -1;
      }),
    ].map(
      (item): CoinItem => ({
        isJetton: false,
        currency: item,
        balance: balances[item],
        decimals: Decimals[item],
      }),
    );

    return [
      ...list,
      ...jettons.map(
        (jetton): CoinItem => ({
          isJetton: true,
          jetton: jetton,
          currency: jetton.jettonAddress,
          balance: jetton.balance,
          decimals: jetton.metadata.decimals,
        }),
      ),
    ];
  }, [jettons, balances, currencies]);

  const selectedCoin = useMemo(
    () => coins.find((item) => item.currency === currency)!,
    [coins, currency],
  );

  if (coins.length === 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <PopupSelect
        items={coins}
        selected={selectedCoin}
        onChange={(item) => onChangeCurrency(item.currency, item.decimals, item.isJetton)}
        keyExtractor={(item) => item.currency}
        width={ns(220)}
        maxHeight={ns(216)}
        asFullWindowOverlay
        renderItem={(item) => (
          <>
            {item.isJetton ? (
              <CurrencyIcon size={24} isJetton uri={item.jetton.metadata.image} />
            ) : (
              <CurrencyIcon size={24} currency={item.currency as CryptoCurrency} />
            )}
            <Spacer x={8} />
            <Text numberOfLines={1} style={{ width: ns(156) }}>
              <Text variant="label1">
                {item.isJetton
                  ? item.jetton.metadata.symbol ?? ''
                  : item.currency.toUpperCase()}
              </Text>
              {'  '}
              <Text color="foregroundSecondary">{formatter.format(item.balance)}</Text>
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
