import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ActionButtonProps, BalanceItemProps } from './BalanceItem.interface';
import * as S from './BalanceItem.style';
import { CurrencyIcon, Icon, Text } from '$uikit';
import { useJettonBalances, useTranslator, useWalletInfo } from '$hooks';
import { walletWalletSelector } from '$store/wallet';
import { openReceive, openRequireWalletModal, openSend, openWallet } from '$navigation';
import { ns } from '$utils';
import {
  CryptoCurrencies,
  CurrencyLongName,
  Decimals,
  getServerConfigSafe,
} from '$shared/constants';
import { formatCryptoCurrency } from '$utils/currency';
import { useNavigation } from '$libs/navigation';

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
  const nav = useNavigation();

  const { enabled: availableJettons } = useJettonBalances();

  const { amount, tokenPrice } = useWalletInfo(currency);

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
    nav.openModal('OldExchange');
  }, [wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    if (availableJettons.length > 0) {
      openSend();
    } else {
      openSend({ currency });
    }
  }, [currency, availableJettons, wallet]);

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
                <Text variant="label1">{tokenPrice.formatted.totalFiat ?? '-'}</Text>
                <Text
                  color={tokenPrice.fiatDiff.color}
                  variant="body2"
                  style={{ flexDirection: 'row' }}
                >
                  {tokenPrice.fiatDiff.percent}&nbsp;
                  <Text color="foregroundTertiary" variant="body2">
                    ·
                  </Text>
                  &nbsp;24{t('wallet_hours_symbol')}
                </Text>
              </S.FiatInfo>
            </S.Info>
          </S.Cont>
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
