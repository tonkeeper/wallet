import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { subMonths } from 'date-fns';
import { Dimensions } from 'react-native';

import { ActionButtonProps, BalanceItemProps } from './BalanceItem.interface';
import * as S from './BalanceItem.style';
import { CurrencyIcon, Icon, Text } from '$uikit';
import { useJettonBalances, useTranslator, useWalletInfo } from '$hooks';
import { walletWalletSelector } from '$store/wallet';
import {
  openReceive,
  openRequireWalletModal,
  openSend,
  openWallet,
} from '$navigation';
import { Chart } from '$shared/components';
import { format, ns } from '$utils';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import {
  CryptoCurrencies,
  CurrencyLongName,
  Decimals,
  FiatCurrencies,
  getServerConfigSafe,
} from '$shared/constants';
import { formatCryptoCurrency, formatFiatCurrencyAmount } from '$utils/currency';
import { fiatCurrencySelector, mainSelector } from '$store/main';
import { getRate } from '$hooks/useFiatRate';
import { useNavigation } from '$libs/navigation';

const ScreenWidth = Dimensions.get('window').width;

const ActionButton: FC<ActionButtonProps> = (props) => {
  const { children, onPress, icon, isLast, iconStyle } = props;

  return (
    <S.Action isLast={isLast}>
      <S.Background borderEnd borderStart />
      <S.ActionCont onPress={onPress}>
        <Icon style={iconStyle} name={icon} color="accentPrimary" />
        <S.ActionLabelWrapper>
          <Text variant="label2">{children}</Text>
        </S.ActionLabelWrapper>
      </S.ActionCont>
    </S.Action>
  );
};

export const BalanceItem: FC<BalanceItemProps> = (props) => {
  const { currency, showActions = false, borderStart = true, borderEnd = true } = props;
  const t = useTranslator();

  const currencyPrepared = useMemo(() => {
    let result = currency;
    if (
      [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
    ) {
      result = CryptoCurrencies.Ton;
    }

    return result;
  }, [currency]);

  const wallet = useSelector(walletWalletSelector);
  const rates = useSelector(ratesRatesSelector);
  const charts = useSelector(ratesChartsSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const nav = useNavigation();

  const availableJettons = useJettonBalances();

  const { amount, fiatInfo } = useWalletInfo(currency);

  const handleOpen = useCallback(() => {
    //openAccessConfirmation();
    openWallet(currency);
  }, [currency]);

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openReceive(currency, false, undefined, true);
  }, [currency, wallet]);

  const handleBuy = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    nav.openModal('Exchange');
  }, [wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    if (availableJettons.length > 0) {
      openSend();
    } else {
      openSend(currency);
    }
  }, [currency, availableJettons, wallet]);

  const chartData = useMemo(() => {
    const width = ScreenWidth - ns(16) * 4;
    const fromDate = format(subMonths(new Date(), 1), 'd MMM');
    //const toDate = format(new Date(), 'd MMM');
    const points = charts[currency] || [];
    const fiatRate =
      fiatCurrency === FiatCurrencies.Usd
        ? 1
        : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);
    const firstPrice = points.length > 0 ? points[0].y * fiatRate : 0;
    const lastPrice = points.length > 0 ? points[points.length - 1].y * fiatRate : 0;

    return {
      width,
      height: width * 0.15,
      fromDate,
      toDate: t('today'),
      points: points,
      firstPrice: formatFiatCurrencyAmount(firstPrice.toFixed(2), fiatCurrency),
      lastPrice: formatFiatCurrencyAmount(lastPrice.toFixed(2), fiatCurrency),
    };
  }, [charts, currency, fiatCurrency, rates, t]);

  const isDisabled = useMemo(() => {
    return (
      [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
    );
  }, [currency]);

  const isLockBadgeShown = useMemo(() => {
    return (
      [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
    );
  }, [currency]);

  return (
    <>
      <S.Container>
        <S.Background borderStart={borderStart} borderEnd={borderEnd} />
        <S.Wrap
          borderStart={borderStart}
          borderEnd={borderEnd}
          onPress={handleOpen}
          isDisabled={isDisabled}
        >
          <S.Cont>
            <S.IconWrap>
              <CurrencyIcon currency={currency} size={44} />
              {isLockBadgeShown && (
                <S.LockBadge>
                  <Icon name="ic-lock-12" color="backgroundSecondary" />
                </S.LockBadge>
              )}
            </S.IconWrap>
            <S.Info>
              <S.CryptoInfo>
                <Text variant="label1">
                  {formatCryptoCurrency(
                    amount,
                    currencyPrepared,
                    Decimals[currencyPrepared],
                    2,
                    true,
                  )}
                </Text>
                <Text color="foregroundSecondary" variant="body2">
                  {CurrencyLongName[currency]}
                </Text>
              </S.CryptoInfo>
              <S.FiatInfo>
                <Text variant="label1">{fiatInfo.amount}</Text>
                <Text
                  color={fiatInfo.color}
                  variant="body2"
                  style={{ flexDirection: 'row' }}
                >
                  {fiatInfo.percent}&nbsp;
                  <Text color="foregroundTertiary" variant="body2">
                    ·
                  </Text>
                  &nbsp;24{t('wallet_hours_symbol')}
                </Text>
              </S.FiatInfo>
            </S.Info>
          </S.Cont>
          {showActions && (
            <>
              <S.ChartWrap>
                <Chart
                  points={chartData.points}
                  width={chartData.width}
                  height={chartData.height}
                />
              </S.ChartWrap>
              <S.ChartDates>
                <S.ChartDatesItem>
                  <Text style={{ textAlign: 'left' }} variant="label2">
                    {chartData.firstPrice}
                  </Text>
                  <Text color="foregroundSecondary" variant="body2">
                    {chartData.fromDate}
                  </Text>
                </S.ChartDatesItem>
                <S.ChartDatesItem>
                  <Text style={{ textAlign: 'right' }} variant="label2">
                    {chartData.lastPrice}
                  </Text>
                  <Text color="foregroundSecondary" variant="body2">
                    {chartData.toDate}
                  </Text>
                </S.ChartDatesItem>
              </S.ChartDates>
            </>
          )}
        </S.Wrap>
      </S.Container>
      {showActions && (
        <S.Actions>
          {getServerConfigSafe('isExchangeEnabled') === 'true' && (
            <ActionButton
              onPress={handleBuy}
              iconStyle={{ marginTop: ns(-2), marginLeft: ns(-2), marginBottom: ns(2) }}
              icon="ic-money-28"
            >
              {t('wallet_buy')}
            </ActionButton>
          )}
          <ActionButton onPress={handleReceive} icon="ic-tray-arrow-down-28">
            {t('wallet_receive')}
          </ActionButton>
          <ActionButton isLast onPress={handleSend} icon="ic-tray-arrow-up-28">
            {t('wallet_send')}
          </ActionButton>
        </S.Actions>
      )}
    </>
  );
};
