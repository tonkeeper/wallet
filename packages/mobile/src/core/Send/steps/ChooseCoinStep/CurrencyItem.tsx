import { useWalletInfo } from '$hooks';
import {
  CryptoCurrencies,
  CryptoCurrency,
  CurrencyLongName,
  Decimals,
} from '$shared/constants';
import { CurrencyIcon, Separator, TokenListItem } from '$uikit';
import { formatCryptoCurrency } from '$utils/currency';
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

  return (
    <TokenListItem
      name={CurrencyLongName[currency]}
      balance={formatCryptoCurrency(
        amount,
        currencyPrepared,
        Decimals[currencyPrepared],
        2,
      )}
      icon={<CurrencyIcon size={44} currency={currency} />}
      onPress={onPress}
      borderStart={borderStart}
      borderEnd={borderEnd}
      bottomOffset={16}
    />
  );
};

export const CurrencyItem = memo(CurrencyItemComponent);
