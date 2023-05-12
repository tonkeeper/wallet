import { useCopyText, useFiatValue, useTranslator } from '$hooks';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { getTokenConfig } from '$shared/dynamicConfig';
import { Highlight, Icon, Separator, Spacer, Text } from '$uikit';
import { maskifyAddress, parseLocaleNumber } from '$utils';
import React, { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { ConfirmStepProps } from './ConfirmStep.interface';
import * as S from './ConfirmStep.style';
import BigNumber from 'bignumber.js';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import { SendSteps } from '$core/Send/Send.interface';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { formatter } from '$utils/formatter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActionFooter,
  useActionFooter,
} from '$core/ModalContainer/NFTOperations/NFTOperationFooter';
import { openInactiveInfo } from '$navigation';
import { Alert } from 'react-native';
import { walletBalancesSelector, walletWalletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';

const ConfirmStepComponent: FC<ConfirmStepProps> = (props) => {
  const {
    stepsScrollTop,
    active,
    currency,
    currencyTitle,
    recipient,
    recipientAccountInfo,
    decimals,
    isJetton,
    fee,
    isInactive,
    amount,
    comment,
    onConfirm: sendTx,
  } = props;

  const { footerRef, onConfirm } = useActionFooter();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const t = useTranslator();

  const copyText = useCopyText();

  const balances = useSelector(walletBalancesSelector);
  const wallet = useSelector(walletWalletSelector);

  const { Logo } = useCurrencyToSend(currency, isJetton, 96);

  const showLockupAlert = useCallback(
    () =>
      new Promise((resolve, reject) =>
        Alert.alert(t('send_lockup_warning_title'), t('send_lockup_warning_caption'), [
          {
            text: t('cancel'),
            style: 'cancel',
            onPress: reject,
          },
          {
            text: t('send_lockup_warning_submit_button'),
            onPress: resolve,
            style: 'destructive',
          },
        ]),
      ),
    [t],
  );

  const showAllBalanceAlert = useCallback(
    () =>
      new Promise((resolve, reject) =>
        Alert.alert(t('send_all_warning_title'), undefined, [
          {
            text: t('cancel'),
            style: 'cancel',
            onPress: reject,
          },
          {
            text: t('continue'),
            onPress: resolve,
            style: 'destructive',
          },
        ]),
      ),
    [t],
  );

  const handleConfirm = useCallback(async () => {
    try {
      const amountWithFee = new BigNumber(parseLocaleNumber(amount.value)).plus(fee);
      if (
        currency === CryptoCurrencies.Ton &&
        wallet &&
        wallet.ton.isLockup() &&
        !amount.all &&
        new BigNumber(balances[currency]).isLessThan(amountWithFee)
      ) {
        await showLockupAlert();
      }

      if (currency === CryptoCurrencies.Ton && amount.all) {
        await showAllBalanceAlert();
      }

      onConfirm(async ({ startLoading }) => {
        startLoading();

        await sendTx();
      })();
    } catch {}
  }, [
    amount,
    fee,
    currency,
    wallet,
    balances,
    t,
    sendTx,
    showLockupAlert,
    showAllBalanceAlert,
  ]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [SendSteps.CONFIRM]: event.contentOffset.y,
    };
  });

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

  const calculatedValue = useMemo(() => {
    if (amount.all && !isJetton) {
      return new BigNumber(parseLocaleNumber(amount.value)).minus(fee).toString();
    }

    return parseLocaleNumber(amount.value);
  }, [amount.all, amount.value, fee, isJetton]);

  const fiatValue = useFiatValue(CryptoCurrencies.Ton, calculatedValue);
  const fiatFee = useFiatValue(CryptoCurrencies.Ton, fee || '0');

  const feeValue = useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return `≈ ${formatter.format(fee, {
      decimals: Decimals[feeCurrency],
      currency: feeCurrency.toUpperCase(),
    })}`;
  }, [fee, feeCurrency]);

  const amountValue = useMemo(() => {
    const value = formatter.format(calculatedValue, {
      decimals,
      currency: currencyTitle,
    });
    if (amount.all && !isJetton) {
      return `≈ ${value}`;
    }

    return value;
  }, [calculatedValue, currencyTitle, amount.all, isJetton]);

  const handleCopy = useCallback(() => {
    if (!recipient) {
      return;
    }

    copyText(recipient.address, t('address_copied'));
  }, [copyText, recipient, t]);

  useEffect(() => {
    if (!active) {
      footerRef.current?.reset();
    }
  }, [active]);

  if (!recipient) {
    return null;
  }

  const recipientName = recipient.domain || recipient.name || recipientAccountInfo?.name;

  return (
    <S.Container>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Content>
          <S.Center>
            <S.IconContainer>{Logo}</S.IconContainer>
            <Spacer y={20} />
            <Text color="foregroundSecondary">
              {t('send_screen_steps.comfirm.title')}
            </Text>
            <Spacer y={4} />
            <Text variant="h3">
              {t('send_screen_steps.comfirm.action', { coin: currencyTitle })}
            </Text>
          </S.Center>
          <Spacer y={32} />
          <S.Table>
            {recipientName ? (
              <S.Item>
                <S.ItemLabel>{t('confirm_sending_recipient')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>{recipientName}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            ) : null}
            <Separator />
            <Highlight onPress={handleCopy}>
              <S.Item>
                <S.ItemLabel>
                  {recipientName
                    ? t('confirm_sending_recipient_address')
                    : t('confirm_sending_recipient')}
                </S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>{maskifyAddress(recipient.address, 4)}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('confirm_sending_amount')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{amountValue}</S.ItemValue>
                <S.ItemSubValue>≈ {fiatValue.fiatInfo.amount}</S.ItemSubValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('confirm_sending_fee')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{feeValue}</S.ItemValue>
                {fee !== '0' ? (
                  <S.ItemSubValue>≈ {fiatFee.fiatInfo.amount}</S.ItemSubValue>
                ) : null}
              </S.ItemContent>
            </S.Item>
            {comment.length > 0 ? (
              <>
                <Separator />
                <S.Item>
                  <S.ItemLabel>
                    {t('send_screen_steps.comfirm.comment_label')}
                  </S.ItemLabel>
                  <S.ItemContent>
                    <S.ItemValue>{comment}</S.ItemValue>
                  </S.ItemContent>
                </S.Item>
              </>
            ) : null}
          </S.Table>
          {isInactive ? (
            <>
              <Spacer y={16} />
              <S.WarningContainer>
                <S.WarningTouchable
                  background="backgroundQuaternary"
                  onPress={openInactiveInfo}
                >
                  <S.WarningContent>
                    <Text variant="label1">
                      {t('confirm_sending_inactive_warn_title')}
                    </Text>
                    <Text variant="body2" color="foregroundSecondary">
                      {t('confirm_sending_inactive_warn_description')}
                    </Text>
                    <Spacer y={4} />
                    <S.WarningRow>
                      <Text variant="label2">
                        {t('confirm_sending_inactive_warn_about')}
                      </Text>
                      <Spacer x={2} />
                      <S.WarningIcon>
                        <Icon name="ic-chevron-right-12" color="foregroundPrimary" />
                      </S.WarningIcon>
                    </S.WarningRow>
                  </S.WarningContent>
                </S.WarningTouchable>
              </S.WarningContainer>
            </>
          ) : null}
        </S.Content>
        <BottomButtonWrapHelper />
      </StepScrollView>
      <S.FooterContainer bottomInset={bottomInset}>
        <ActionFooter
          withCloseButton={false}
          confirmTitle={t('confirm_sending_submit')}
          onPressConfirm={handleConfirm}
          ref={footerRef}
        />
      </S.FooterContainer>
    </S.Container>
  );
};

export const ConfirmStep = memo(ConfirmStepComponent);
