import { useWalletInfo } from '$hooks';
import {
  CryptoCurrencies,
  CryptoCurrency,
  CurrencyLongName,
} from '$shared/constants';
import { CurrencyIcon, TokenListItem } from '$uikit';
import { formatter } from '$utils/formatter';
import React, { FC, memo } from 'react';

interface Props {
  currency: CryptoCurrency;
  borderStart?: boolean;
  borderEnd?: boolean;
  onPress?: () => void;
}

const CurrencyItemComponent: FC<Props> = (props) => {
  const { currency, borderStart, borderEnd, onPress } = props;

  const { amount } = useWalletInfo(currency);

  const currencyPrepared =
    [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
      ? CryptoCurrencies.Ton
      : currency;

  const balance = formatter.format(amount, {
    currency: currencyPrepared.toUpperCase(),
    currencySeparator: 'wide',
  });
    
  return (
    <TokenListItem
      name={CurrencyLongName[currency]}
      balance={balance}
      icon={<CurrencyIcon size={44} currency={currency} />}
      onPress={onPress}
      borderStart={borderStart}
      borderEnd={borderEnd}
      bottomOffset={16}
    />
  );
};

export const CurrencyItem = memo(CurrencyItemComponent);
