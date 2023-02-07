import React, { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native';

import { EditCoinsProps } from './EditCoins.interface';
import { BottomSheet, CurrencyIcon } from '$uikit';
import { useTheme, useTranslator } from '$hooks';
import { walletActions, walletSelector } from '$store/wallet';
import {
  CryptoCurrency,
  CurrencyLongName,
  SecondaryCryptoCurrencies,
} from '$shared/constants';
import { toastActions } from '$store/toast';
import { saveAddedCurrencies } from '$database';
import { ns } from '$utils';
import * as S from './EditCoins.style';

export const EditCoins: FC<EditCoinsProps> = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const t = useTranslator();
  const { currencies, balances } = useSelector(walletSelector);

  const data = useMemo(() => {
    let result: { currency: CryptoCurrency; isAdded: boolean }[] = [];

    for (const currency of SecondaryCryptoCurrencies) {
      result.push({
        currency,
        isAdded: currencies.indexOf(currency) > -1 || +balances[currency] > 0,
      });
    }

    return result;
  }, [currencies, balances]);

  const handlePress = useCallback(
    (currency: CryptoCurrency) => () => {
      const index = currencies.indexOf(currency);
      const currenciesCopy = [...currencies];

      if (index > -1) {
        currenciesCopy.splice(index, 1);
        dispatch(toastActions.hide());
      } else {
        currenciesCopy.push(currency);
        dispatch(toastActions.success(t('edit_coins_added_toast')));
      }

      dispatch(walletActions.setCurrencies(currenciesCopy));
      saveAddedCurrencies(currenciesCopy).catch((err) =>
        console.log('saveAddedCurrencies error', err),
      );
    },
    [currencies, dispatch, t],
  );

  return (
    <BottomSheet title={t('edit_coins_title')}>
      <FlatList
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        style={{
          paddingHorizontal: ns(16),
        }}
        data={data}
        keyExtractor={(item) => item.currency}
        renderItem={({ item }) => {
          const canRemove = !(+balances[item.currency] > 0);
          return (
            <S.Item>
              <CurrencyIcon currency={item.currency} size={36} />
              <S.ItemName>{CurrencyLongName[item.currency]}</S.ItemName>
              <S.ItemButton
                mode={item.isAdded ? 'secondary' : 'primary'}
                size="small"
                disabled={!canRemove}
                inverted
                onPress={handlePress(item.currency)}
              >
                {t(
                  item.isAdded
                    ? canRemove
                      ? 'edit_coins_hide'
                      : 'edit_coins_added'
                    : 'edit_coins_add',
                )}
              </S.ItemButton>
            </S.Item>
          );
        }}
        contentContainerStyle={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: ns(16),
        }}
        ItemSeparatorComponent={() => (
          <S.SeparatorWrap>
            <S.Separator />
          </S.SeparatorWrap>
        )}
      />
    </BottomSheet>
  );
};
