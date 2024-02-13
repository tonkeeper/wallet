import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TonWeb from 'tonweb';
import { getUnixTime } from 'date-fns';
import { CreateSubscriptionProps } from './CreateSubscription.interface';
import * as S from './CreateSubscription.style';
import { Button, Icon, Loader, Text } from '$uikit';
import { List } from '@tonkeeper/uikit';
import { SubscriptionModel } from '$store/models';
import {
  format,
  formatSubscriptionPeriod,
  toLocaleNumber,
  triggerNotificationSuccess,
} from '$utils';
import { subscriptionsActions } from '$store/subscriptions';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatCryptoCurrency } from '$utils/currency';
import { useWalletInfo } from '$hooks/useWalletInfo';
import { walletWalletSelector } from '$store/wallet';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { Toast } from '$store';
import { network } from '$libs/network';
import { t } from '@tonkeeper/shared/i18n';
import { push } from '$navigation/imperative';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Modal, View } from '@tonkeeper/uikit';
import { config } from '$config';
import { tk } from '$wallet';

export const CreateSubscription: FC<CreateSubscriptionProps> = ({
  invoiceId = null,
  isEdit = false,
  subscription = null,
  fee: passedFee = null,
}) => {
  const dispatch = useDispatch();

  const nav = useNavigation();
  const wallet = useSelector(walletWalletSelector);
  const { amount: balance } = useWalletInfo();

  const [isLoading, setLoading] = useState(!isEdit);
  const [failed, setFailed] = useState(0);
  const [fee, setFee] = useState(
    passedFee || (subscription && subscription.fee ? subscription.fee : '~'),
  );
  const [info, setInfo] = useState<SubscriptionModel | null>(subscription);
  const [isSending, setSending] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [totalMoreThanBalance, setTotalMoreThanBalance] = React.useState(false);
  const closeTimer = useRef<any>(null);

  useEffect(() => {
    if (fee !== '~') {
      const amount = Ton.fromNano(info?.amountNano ?? '0');
      const totalIsMoreBalance = new BigNumber(amount).plus(fee).isGreaterThan(balance);
      setTotalMoreThanBalance(totalIsMoreBalance);
    }
  }, [info, balance, fee]);

  useEffect(() => {
    if (isSuccess) {
      triggerNotificationSuccess();
      closeTimer.current = setTimeout(() => {
        nav.goBack();

        if (!isEdit && !subscription) {
          const returnUrl = info!.userReturnUrl;
          Alert.alert(
            t('subscription_back_to_merchant_title'),
            t('subscription_back_to_merchant_caption'),
            [
              {
                text: t('cancel'),
                style: 'cancel',
              },
              {
                text: t('subscription_back_to_merchant_button'),
                onPress: () => {
                  Linking.openURL(returnUrl).catch((err) => {
                    console.log(err);
                  });
                },
              },
            ],
          );
        }
      }, 2500);
    }

    return () => closeTimer.current && clearTimeout(closeTimer.current);
  }, [isSuccess]);

  const loadInfo = useCallback(() => {
    const host = config.get('subscriptionsHost', tk.wallet.isTestnet);
    network
      .get(`${host}/v1/subscribe/invoice/${invoiceId}`, {
        params: {
          contractVersion: TonWeb.version,
        },
      })
      .then((resp) => {
        setInfo(resp.data.data as any);
        setLoading(false);
      })
      .catch((e) => {
        Toast.fail(e.message);
        nav.goBack();
      });
  }, [invoiceId]);

  useEffect(() => {
    if (!isEdit) {
      loadInfo();
    }
  }, []);

  useEffect(() => {
    if (info && !subscription) {
      wallet!.ton
        .createSubscription(
          wallet!.vault,
          info.address,
          info.amountNano,
          info.intervalSec,
          info.subscriptionId,
          true,
        )
        .then((res) => {
          setFee(Ton.fromNano(res.fee.toString()));
        })
        .catch((err) => {
          console.log('ERR10', err);
        });
    }
  }, [info, wallet]);

  const priceFormatted = useMemo(() => {
    return formatCryptoCurrency(
      Ton.fromNano(info?.amountNano ?? '0'),
      CryptoCurrencies.Ton,
      Decimals[CryptoCurrencies.Ton],
    );
  }, [info]);

  const periodFormatted = useMemo(() => {
    if (!info) {
      return '';
    }

    return formatSubscriptionPeriod(info.intervalSec);
  }, [info]);

  const nextBill = useMemo(() => {
    if (!info || !info.chargedAt) {
      return null;
    }

    if (!info.isActive) {
      const now = getUnixTime(new Date());
      if (info.chargedAt + info.intervalSec < now) {
        return null;
      }
    }

    return format((info.chargedAt + info.intervalSec) * 1000, 'EEE, MMM d');
  }, [info]);

  const handleSubscribe = useCallback(() => {
    setSending(true);
    dispatch(
      subscriptionsActions.subscribe({
        subscription: info!,
        onDone: () => {
          setSuccess(true);
        },
        onFail: () => {
          setSending(false);
        },
      }),
    );
  }, [dispatch, info]);

  const handleUnsubscribe = useCallback(() => {
    Alert.alert(
      t('subscription_cancel_alert_title'),
      t('subscription_cancel_alert_caption', {
        nextBill,
      }),
      [
        {
          text: t('subscription_cancel_alert_cancel_btn'),
          style: 'cancel',
        },
        {
          text: t('subscription_cancel_alert_submit_btn'),
          style: 'destructive',
          onPress: () => {
            setSending(true);
            dispatch(
              subscriptionsActions.unsubscribe({
                subscription: info!,
                onDone: () => {
                  setSuccess(true);
                },
                onFail: () => {
                  setSending(false);
                },
              }),
            );
          },
        },
      ],
    );
  }, [dispatch, info, nextBill, t]);

  const isButtonShown = useMemo(() => {
    if (!info) {
      return false;
    }

    if (isEdit) {
      return info?.isActive;
    }

    return info.status === 'new' || info.isActive;
  }, [info, isEdit, isSuccess, isSending]);

  const handleOpenMerchant = useCallback(() => {
    Linking.openURL(info!.returnUrl).catch((err) => {
      console.log(err);
    });
  }, [info]);

  function renderButton() {
    if (isSuccess) {
      return (
        <S.SuccessWrap>
          <Icon name="ic-success-28" color="accentPositive" />
          <S.SuccessLabelWrapper>
            <Text color="accentPositive" variant="label2">
              {t('subscription_sent')}
            </Text>
          </S.SuccessLabelWrapper>
        </S.SuccessWrap>
      );
    }

    if (isSending) {
      return (
        <S.ButtonSending>
          <Loader size="medium" />
        </S.ButtonSending>
      );
    }

    if (isEdit || info?.isActive) {
      return (
        <Button onPress={handleUnsubscribe} isLoading={isSending} mode="secondary">
          {t('subscription_cancel')}
        </Button>
      );
    }

    return (
      <Button
        onPress={handleSubscribe}
        isLoading={isSending}
        disabled={fee === '~' || totalMoreThanBalance}
      >
        {totalMoreThanBalance
          ? t('send_insufficient_funds')
          : t('subscription_subscribe')}
      </Button>
    );
  }

  function renderContent() {
    if (isLoading || !info) {
      return (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      );
    }

    // ToDo: Сделать верстку, когда будет дизайн
    if (failed) {
      return <Text>Failed</Text>;
    }

    return (
      <>
        <S.Header>
          <S.MerchantPhoto source={{ uri: info.merchantPhoto }} />
          <S.MerchantInfoWrap>
            <S.MerchantInfo>
              <Text variant="label1" numberOfLines={1} fontWeight="700">
                {info.merchantName}
              </Text>
              <S.ProductNameWrapper>
                <Text variant="body1" numberOfLines={1}>
                  {info.productName}
                </Text>
              </S.ProductNameWrapper>
            </S.MerchantInfo>
            {info.status === 'created' && (
              <Button mode="secondary" size="small" onPress={handleOpenMerchant}>
                {t('subscription_open_merchant')}
              </Button>
            )}
          </S.MerchantInfoWrap>
        </S.Header>
        <List>
          <List.Item
            titleType="secondary"
            title={t('subscription_price')}
            value={priceFormatted}
          />
          <List.Item
            titleType="secondary"
            title={t('subscription_period')}
            value={periodFormatted}
          />
          <List.Item
            titleType="secondary"
            title={t('subscription_fee')}
            value={`${toLocaleNumber(fee)} TON`}
          />
          {info.isActive && (
            <List.Item
              titleType="secondary"
              title={t('subscription_next_bill')}
              value={nextBill}
            />
          )}
          {!info.isActive && !!nextBill && (
            <List.Item
              titleType="secondary"
              title={t('subscription_expiring')}
              value={nextBill}
            />
          )}
        </List>
        <S.Content>
          {isButtonShown && <S.ButtonWrap>{renderButton()}</S.ButtonWrap>}
        </S.Content>
      </>
    );
  }

  return (
    <Modal>
      <Modal.Header title={t('subscription_title')} />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>{renderContent()}</View>
      </Modal.Content>
    </Modal>
  );
};

export function openCreateSubscription(invoiceId: string) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: CreateSubscription,
    params: { invoiceId },
    path: 'CREATE_SUBSCRIPTION',
  });
}

export function openSubscription(
  subscription: SubscriptionModel,
  fee: string | null = null,
  isEdit?: boolean,
) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: CreateSubscription,
    params: { subscription, fee, isEdit },
    path: 'CREATE_SUBSCRIPTION',
  });
}
