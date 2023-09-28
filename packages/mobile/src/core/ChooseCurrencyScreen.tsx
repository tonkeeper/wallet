import React from 'react';
import { Icon, Screen, Text } from '$uikit';
import { StyleSheet, View } from 'react-native';
import { ns } from '$utils';
import { useDispatch, useSelector } from 'react-redux';
import { mainActions, mainSelector } from '$store/main';
import { t } from '@tonkeeper/shared/i18n';
import { CellSection, CellSectionItem } from '$shared/components';
import { FiatCurrencySymbolsConfig, FiatCurrencies } from '@tonkeeper/core';

export const ChooseCurrencyScreen: React.FC = () => {
  const { fiatCurrency } = useSelector(mainSelector);
  const dispatch = useDispatch();
  const currencies = React.useMemo(() => {
    return Object.keys(FiatCurrencySymbolsConfig) as FiatCurrencies[];
  }, []);

  const handleChangeCurrency = React.useCallback(
    (currency: FiatCurrencies) => {
      dispatch(mainActions.setFiatCurrency(currency));
    },
    [dispatch],
  );

  return (
    <Screen>
      <Screen.Header title={t('choose_currency.header_title')} />
      <Screen.ScrollView>
        <CellSection>
          {currencies.map((currency) => (
            <CellSectionItem
              onPress={() => handleChangeCurrency(currency)}
              key={`currency-${currency}`}
              inlineContent={
                <>
                  {fiatCurrency === currency && (
                    <Icon name="ic-donemark-thin-28" color="accentPrimary" />
                  )}
                </>
              }
              content={
                <View style={styles.item}>
                  <Text variant="label1">{currency.toUpperCase()}</Text>
                  <Text
                    style={styles.currencyCaptionText}
                    color="foregroundSecondary"
                    variant="body1"
                  >
                    {t(`choose_currency.currencies.${currency.toUpperCase()}`)}
                  </Text>
                </View>
              }
            />
          ))}
        </CellSection>
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
  },
  currencyCaptionText: {
    paddingLeft: ns(8),
  },
});
