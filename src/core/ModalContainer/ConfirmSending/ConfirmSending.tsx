import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import BigNumber from 'bignumber.js';

import { ConfirmSendingProps } from './ConfirmSending.interface';
import { BottomSheet, Button, Icon, List, ListCell, Text } from '$uikit';
import * as S from './ConfirmSending.style';
import { useTranslator } from '$hooks';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import {walletActions, walletBalancesSelector, walletSelector, walletWalletSelector} from '$store/wallet';
import { formatCryptoCurrency } from '$utils/currency';
import { getTokenConfig } from '$shared/dynamicConfig';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import {
  goBack,
  openInactiveInfo,
  openReminderEnableNotificationsModal,
} from '$navigation';
import { ns, maskifyAddress } from '$utils';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import {favoritesFavoritesSelector, favoritesSelector} from '$store/favorites';

export const ConfirmSending: FC<ConfirmSendingProps> = (props) => {
  const {
    currency,
    address,
    amount,
    comment,
    fee,
    withGoBack,
    isInactive,
    isJetton,
    domain,
  } = props;

  const t = useTranslator();

  const dispatch = useDispatch();

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const [isSent, setSent] = useState(false);
  const [isSending, setSending] = useState(false);
  const balances = useSelector(walletBalancesSelector);
  const wallet = useSelector(walletWalletSelector);
  const [isClosed, setClosed] = useState(false);
  const favorites = useSelector(favoritesFavoritesSelector);

  const favoriteName = useMemo(
    () => favorites.find((favorite) => favorite.address === address)?.name,
    [address, favorites],
  );

  const { decimals, jettonWalletAddress, currencyTitle, Logo } = useCurrencyToSend(
    currency,
    isJetton,
    72,
  );

  const handleOpenInactiveInfo = useCallback(() => {
    setClosed(true);
    setTimeout(() => {
      openInactiveInfo();
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (isSent && (withGoBack ?? true)) {
        goBack();
        setTimeout(() => {
          openReminderEnableNotificationsModal();
        }, 350);
      }
    };
  }, [isSent, withGoBack]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const doSend = useCallback(() => {
    setSending(true);
    dispatch(
      walletActions.sendCoins({
        currency,
        amount,
        address,
        comment,
        isJetton,
        jettonWalletAddress,
        decimals,
        onDone: () => {
          setSending(false);
          setSent(true);
        },
        onFail: () => setSending(false),
      }),
    );
  }, [
    address,
    amount,
    comment,
    currency,
    decimals,
    dispatch,
    isJetton,
    jettonWalletAddress,
  ]);

  const handleSend = useCallback(() => {
    const amountWithFee = new BigNumber(amount).plus(fee);
    if (
      currency === CryptoCurrencies.Ton &&
      wallet &&
      wallet.ton.isLockup() &&
      new BigNumber(balances[currency]).isLessThan(amountWithFee)
    ) {
      Alert.alert(t('send_lockup_warning_title'), t('send_lockup_warning_caption'), [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('send_lockup_warning_submit_button'),
          onPress: () => doSend(),
          style: 'destructive',
        },
      ]);
    } else {
      doSend();
    }
  }, [amount, fee, currency, wallet, balances, t, doSend]);

  const text = useMemo(() => {
    if (currency === CryptoCurrencies.Ton) {
      return t('confirm_sending_sent_caption_ton');
    } else {
      return t('confirm_sending_sent_caption_other');
    }
  }, [currency, t]);

  const feeCurrency = useMemo(() => {
    const tokenConfig = getTokenConfig(currency);
    if (tokenConfig && tokenConfig.blockchain === 'ethereum') {
      return CryptoCurrencies.Eth;
    } else if (isJetton) {
      return CryptoCurrencies.Ton;
    } else {
      return currency;
    }
  }, [currency, isJetton]);

  const renderChevron = useCallback(({ isPressed }) => {
    return (
      <S.ChevronWrap>
        <Icon
          color={!isPressed ? 'foregroundPrimary' : 'foregroundSecondary'}
          name="ic-chevron-right-12"
        />
      </S.ChevronWrap>
    );
  }, []);

  const feeValue = React.useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return `≈ ${formatCryptoCurrency(fee, feeCurrency, Decimals[feeCurrency])}`;
  }, [fee, feeCurrency]);

  function renderContent() {
    if (isSent) {
      return (
        <>
          <S.Wrap>
            {Logo}
            <S.TitleWrapper>
              <Text variant="h2" textAlign="center">
                {t(
                  isJetton
                    ? 'confirm_sending_sent_jetton_title'
                    : 'confirm_sending_sent_title',
                )}
              </Text>
            </S.TitleWrapper>
            <S.CaptionWrapper>
              <Text color="foregroundSecondary" variant="body1" textAlign="center">
                {text}
              </Text>
            </S.CaptionWrapper>
          </S.Wrap>
          <S.Buttons>
            <Button onPress={handleClose}>{t('continue')}</Button>
          </S.Buttons>
        </>
      );
    } else {
      return (
        <S.ListWrap>
          <List align="left">
            {domain ? (
              <>
                <ListCell label={t('confirm_sending_recipient')}>{domain}</ListCell>
                <ListCell label={t('confirm_sending_recipient_address')}>
                  {favoriteName || maskifyAddress(address, 4)}
                </ListCell>
              </>
            ) : (
              <>
                {favoriteName ? (
                  <ListCell label={t('confirm_sending_recipient')}>
                    {favoriteName}
                  </ListCell>
                ) : null}
                <ListCell
                  label={
                    favoriteName
                      ? t('confirm_sending_recipient_address')
                      : t('confirm_sending_recipient')
                  }
                >
                  {maskifyAddress(address, 4)}
                </ListCell>
              </>
            )}

            <ListCell label={t('confirm_sending_amount')}>
              {formatCryptoCurrency(amount, currencyTitle, decimals)}
            </ListCell>
            <ListCell label={t('confirm_sending_fee')}>{feeValue}</ListCell>
            {!!comment && (
              <ListCell label={t('confirm_sending_message')}>{comment}</ListCell>
            )}
          </List>
          {isInactive ? (
            <S.Card>
              <S.Background />
              <S.ContentWrap>
                <S.TextWrap>
                  <S.LabelWrapper>
                    <Text variant="label1">
                      {t('confirm_sending_inactive_warn_title')}
                    </Text>
                  </S.LabelWrapper>
                  <S.DescriptionWrapper>
                    <Text variant="body2" color="foregroundSecondary">
                      {t('confirm_sending_inactive_warn_description')}
                    </Text>
                  </S.DescriptionWrapper>
                  <Button
                    titleFont="regular"
                    withoutFixedHeight
                    onPress={handleOpenInactiveInfo}
                    size="small"
                    style={{ alignSelf: 'flex-start' }}
                    withoutTextPadding
                    mode="tertiary"
                    after={renderChevron}
                  >
                    {t('confirm_sending_inactive_warn_about')}
                  </Button>
                </S.TextWrap>
                <Icon
                  style={{ marginTop: ns(4) }}
                  color="foregroundPrimary"
                  name="ic-exclamationmark-triangle-36"
                />
              </S.ContentWrap>
            </S.Card>
          ) : null}
          <S.SendButton isLoading={isSending} onPress={handleSend}>
            {t('confirm_sending_submit')}
          </S.SendButton>
        </S.ListWrap>
      );
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      triggerClose={isClosed}
      title={t('confirm_sending_title')}
      skipHeader={isSent}
    >
      {renderContent()}
    </BottomSheet>
  );
};
