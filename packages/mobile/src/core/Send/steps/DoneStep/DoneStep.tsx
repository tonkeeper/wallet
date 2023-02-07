import { useTranslator } from '$hooks';
import {
  goBack,
  openAddFavorite,
  openReminderEnableNotificationsModal,
} from '$navigation';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { getTokenConfig } from '$shared/dynamicConfig';
import { toastActions } from '$store/toast';
import { Button, Icon } from '$uikit';
import { maskifyAddress, parseLocaleNumber } from '$utils';
import { formatCryptoCurrency } from '$utils/currency';
import BigNumber from 'bignumber.js';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { DoneStepProps } from './DoneStep.interface';
import * as S from './DoneStep.style';

const DoneStepComponent: FC<DoneStepProps> = (props) => {
  const {
    amount,
    comment,
    decimals,
    fee,
    currencyTitle,
    currency,
    isJetton,
    recipient,
    recipientAccountInfo,
  } = props;

  const t = useTranslator();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const dispatch = useDispatch();

  const feeCurrency = useMemo(() => {
    const tokenConfig = getTokenConfig(currency as CryptoCurrency);
    if (tokenConfig && tokenConfig.blockchain === 'ethereum') {
      return CryptoCurrencies.Eth;
    } else if (isJetton) {
      return CryptoCurrencies.Ton;
    } else {
      return currency;
    }
  }, [currency, isJetton]);

  const feeValue = useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return formatCryptoCurrency(fee, feeCurrency, Decimals[feeCurrency]);
  }, [fee, feeCurrency]);

  const amountValue = useMemo(() => {
    if (amount.all && !isJetton) {
      return formatCryptoCurrency(
        new BigNumber(parseLocaleNumber(amount.value)).minus(fee).toString(),
        currencyTitle,
        decimals,
      );
    }

    return formatCryptoCurrency(parseLocaleNumber(amount.value), currencyTitle, decimals);
  }, [amount, currencyTitle, decimals, fee, isJetton]);

  const handlePressDone = useCallback(() => {
    goBack();
    setTimeout(() => {
      openReminderEnableNotificationsModal();
    }, 350);
  }, []);

  const addToFavorite = useCallback(() => {
    if (!recipient) {
      return;
    }

    openAddFavorite({
      address: recipient.address,
      domain: recipient.domain,
      name: recipientAccountInfo?.name,
      onSave: () => {
        dispatch(toastActions.success(t('send_screen_steps.done.favorite_saved')));
        setTimeout(handlePressDone, 350);
      },
    });
  }, [dispatch, handlePressDone, recipient, recipientAccountInfo, t]);

  if (!recipient) {
    return null;
  }

  const shortAddress = maskifyAddress(recipient.address, 4);

  const recipientName = recipient.domain || recipient.name || recipientAccountInfo?.name;

  return (
    <S.Container bottomInset={bottomInset}>
      <S.ContentContainer>
        <Icon name="ic-done-84" color="accentPositive" />
        <S.Title>
          {t('send_screen_steps.done.title', { currency: currencyTitle })}
        </S.Title>
        <S.Description>{t('send_screen_steps.done.description')}</S.Description>
        <S.DetailsContainer>
          <S.Amount>− {amountValue}</S.Amount>
          {recipientName ? (
            <S.DetailsText>
              {t('send_screen_steps.done.to', {
                name: recipientName,
              })}
            </S.DetailsText>
          ) : null}
          <S.DetailsText>
            {recipientName
              ? t('send_screen_steps.done.address', {
                  address: shortAddress,
                })
              : t('send_screen_steps.done.to', {
                  name: shortAddress,
                })}
          </S.DetailsText>
          {recipientAccountInfo?.memoRequired ? (
            <S.DetailsText>
              {t('send_screen_steps.done.comment', {
                comment,
              })}
            </S.DetailsText>
          ) : null}
          <S.DetailsText>
            {t('send_screen_steps.done.fee', {
              fee: feeValue,
            })}
          </S.DetailsText>
        </S.DetailsContainer>
        {!recipient.name ? (
          <S.AddToFavoritesContainer>
            <Button mode="secondary" onPress={addToFavorite}>
              {t('send_screen_steps.done.add_favorite')}
            </Button>
          </S.AddToFavoritesContainer>
        ) : null}
      </S.ContentContainer>
      <Button onPress={handlePressDone}>{t('send_screen_steps.done.done_label')}</Button>
    </S.Container>
  );
};

export const DoneStep = memo(DoneStepComponent);
