import React, { FC, useCallback, useMemo, useState } from 'react';
const TonWeb = require('tonweb');
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionProps } from './Subscription.interface';
import {Button, Modal, Separator, Text} from '$uikit';
import * as S from './Subscription.style';
import { format, ns } from '$utils';
import { subscriptionsActions } from '$store/subscriptions';
import { goBack } from '$navigation/imperative';
import { Linking } from 'react-native';
import {Ton} from "$libs/Ton";
import { t } from '@tonkeeper/shared/i18n';

export const Subscription: FC<SubscriptionProps> = ({ route }) => {
  const {
    id,
    name,
    merchantName,
    merchantId,
    price,
    period,
    userId,
    iconUrl,
    returnUrl,
  } = route.params.subscription;
  const isEdit = !!id;

  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isSending, setSending] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const priceFormatted = useMemo(() => {
    return Ton.fromNano(price.toString());
  }, [price]);

  const periodFormatted = useMemo(() => {
    if (period === 'month') {
      return 'Monthly';
    } else if (period === 'week') {
      return 'Weekly';
    } else if (period === 'day') {
      return 'Daily';
    } else if (period === 'hour') {
      return 'Hourly';
    } else if (period === 'minute') {
      return 'Every minute';
    } else if (period === 'halfMinute') {
      return 'Every 30 seconds';
    }
  }, [period]);

  const nextBill = useMemo(() => {
    let periodInt = 0;
    if (period === 'month') {
      periodInt = 86400 * 30;
    } else if (period === 'week') {
      periodInt = 86400 * 7;
    } else if (period === 'day') {
      periodInt = 86400;
    } else if (period === 'hour') {
      periodInt = 3600;
    } else if (period === 'minute') {
      periodInt = 60;
    } else if (period === 'halfMinute') {
      periodInt = 30;
    }

    return format(Date.now() + periodInt * 1000, 'EEE, MMM d');
  }, [period]);

  const handleSubscribe = useCallback(() => {
    setSending(true);
    dispatch(
      subscriptionsActions.subscribe({
        subscription: {
          name,
          period,
          merchantId,
          merchantName,
          price,
          userId,
          iconUrl,
          returnUrl,
        },
        onDone: () => {
          setSuccess(true);
        },
        onFail: () => {
          setSending(false);
        },
      }),
    );
  }, [dispatch, merchantId, merchantName, name, period, price, userId]);

  const handleUnsubscribe = useCallback(() => {
    setSending(true);
    dispatch(
      subscriptionsActions.unsubscribe({
        subscriptionId: id!,
        onDone: () => {
          goBack();
        },
        onFail: () => {
          setSending(false);
        },
      }),
    );
  }, [dispatch, id]);

  const handleClose = useCallback(() => {
    goBack();

    Linking.canOpenURL(returnUrl).then(() => {
      Linking.openURL(returnUrl).catch((err) => console.log('err', err));
    });
  }, [returnUrl]);

  function renderContent() {
    if (isSuccess) {
      return (
        <>
          <S.SuccessWrap>
            <S.SuccessIcon source={{ uri: iconUrl }} />
            <S.SuccessTitleWrapper>
              <Text textAlign="center" variant="h2">
                {t('subscription_started')}
              </Text>
            </S.SuccessTitleWrapper>
            <S.SuccessCaptionWrapper>
              <Text textAlign="center" color="foregroundSecondary" variant="body1">
                {t('confirm_sending_sent_caption_ton')}
              </Text>
            </S.SuccessCaptionWrapper>
          </S.SuccessWrap>
          <S.SuccessButtons style={{ paddingBottom: bottomInset + ns(16) }}>
            <Button onPress={handleClose}>
              {t('subscription_back_to_merchant_name', { merchantName })}
            </Button>
          </S.SuccessButtons>
        </>
      );
    }

    return (
      <>
        <S.Header>
          <Text numberOfLines={1} variant="body1" color="foregroundSecondary">
            {merchantName}
          </Text>
          <S.NameWrapper>
            <Text numberOfLines={1} variant="h3">
              {name}
            </Text>
          </S.NameWrapper>
        </S.Header>
        <S.Content style={{ paddingBottom: Math.max(bottomInset, ns(16)) }}>
          <S.Info>
            <S.InfoCell>
              <S.InfoCellLabel>{t('subscription_price')}</S.InfoCellLabel>
              <S.InfoCellValue>{priceFormatted} TON</S.InfoCellValue>
              <Separator absolute />
            </S.InfoCell>
            <S.InfoCell>
              <S.InfoCellLabel>{t('subscription_period')}</S.InfoCellLabel>
              <S.InfoCellValue>{periodFormatted}</S.InfoCellValue>
              <Separator absolute />
            </S.InfoCell>
            <S.InfoCell>
              <S.InfoCellLabel>{t('subscription_next_bill')}</S.InfoCellLabel>
              <S.InfoCellValue>{nextBill}</S.InfoCellValue>
            </S.InfoCell>
          </S.Info>
          <S.ButtonWrap>
            {isEdit && (
              <Button onPress={handleUnsubscribe} isLoading={isSending} mode="secondary">
                {t('subscription_unsubscribe')}
              </Button>
            )}
            {!isEdit && (
              <Button onPress={handleSubscribe} isLoading={isSending}>
                {t('subscription_subscribe')}
              </Button>
            )}
          </S.ButtonWrap>
        </S.Content>
      </>
    );
  }

  return <Modal>{renderContent()}</Modal>;
};
