import { useCopyText } from '$hooks/useCopyText';
import { useFiatValue } from '$hooks/useFiatValue';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { getTokenConfig } from '$shared/dynamicConfig';
import { Highlight, Icon, Separator, Spacer, StakedTonIcon, Text } from '$uikit';
import { isIOS, parseLocaleNumber } from '$utils';
import React, { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { ConfirmStepProps } from './ConfirmStep.interface';
import * as S from './ConfirmStep.style';
import BigNumber from 'bignumber.js';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { formatter } from '$utils/formatter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActionFooter,
  useActionFooter,
} from '$core/ModalContainer/NFTOperations/NFTOperationFooter';
import { Alert } from 'react-native';
import { walletBalancesSelector, walletWalletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';
import { SkeletonLine } from '$uikit/Skeleton/SkeletonLine';
import { useStakingStore } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { openInactiveInfo } from '$core/ModalContainer/InfoAboutInactive/InfoAboutInactive';
import { Address } from '@tonkeeper/core';
import { getImplementationIcon } from '$utils/staking';

const ConfirmStepComponent: FC<ConfirmStepProps> = (props) => {
  const {
    currency,
    currencyTitle,
    recipient,
    recipientAccountInfo,
    decimals,
    isJetton,
    isPreparing,
    fee,
    active,
    isInactive,
    amount,
    comment,
    isCommentEncrypted,
    onConfirm: sendTx,
  } = props;

  const { footerRef, onConfirm } = useActionFooter();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const copyText = useCopyText();

  const balances = useSelector(walletBalancesSelector);
  const wallet = useSelector(walletWalletSelector);

  const { Logo, isLiquidJetton, liquidJettonPool } = useCurrencyToSend(
    currency,
    isJetton,
  );

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
    [],
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
    [],
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
    amount.value,
    amount.all,
    fee,
    currency,
    wallet,
    balances,
    onConfirm,
    showLockupAlert,
    showAllBalanceAlert,
    sendTx,
  ]);

  const feeCurrency = useMemo(() => {
    const tokenConfig = getTokenConfig(currency as CryptoCurrency);
    if (currency === 'usdt') {
      return 'USDT';
    } else if (tokenConfig && tokenConfig.blockchain === 'ethereum') {
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

  const fiatValue = useFiatValue(
    currency as CryptoCurrency,
    calculatedValue,
    decimals,
    isJetton,
  );

  const fiatFee = useFiatValue(
    currency === 'usdt' ? 'USDT' : CryptoCurrencies.Ton,
    fee || '0',
    6,
    currency === 'usdt' ? 6 : Decimals[CryptoCurrencies.Ton],
  );

  const feeValue = useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return `≈ ${formatter.format(fee, {
      decimals: currency === 'usdt' ? 6 : Decimals[feeCurrency],
      currency: feeCurrency.toUpperCase(),
      currencySeparator: 'wide',
    })}`;
  }, [currency, fee, feeCurrency]);

  const amountValue = useMemo(() => {
    const value = formatter.format(calculatedValue, {
      decimals,
      currency: currencyTitle,
      currencySeparator: 'wide',
    });
    if (amount.all && !isJetton) {
      return `≈ ${value}`;
    }

    return value;
  }, [calculatedValue, decimals, currencyTitle, amount.all, isJetton]);

  const handleCopy = useCallback(() => {
    if (!recipient) {
      return;
    }

    copyText(recipient.address, t('address_copied'));
  }, [copyText, recipient]);

  useEffect(() => {
    if (!active) {
      footerRef.current?.reset();
    }
  }, [active, footerRef]);

  if (!recipient) {
    return null;
  }

  const recipientName = recipient.domain || recipient.name || recipientAccountInfo?.name;

  return (
    <S.Container>
      <StepScrollView active={active}>
        <S.Content>
          <S.Center>
            {liquidJettonPool ? (
              <StakedTonIcon pool={liquidJettonPool} size="large" />
            ) : (
              Logo
            )}
            <Spacer y={20} />
            <Text color="foregroundSecondary">
              {t('send_screen_steps.comfirm.title')}
            </Text>
            <Spacer y={4} />
            <Text variant="h3">
              {/* TODO: need translation */}
              {currencyTitle === 'USDT'
                ? 'Transfer USDT TRC20'
                : t('send_screen_steps.comfirm.action', {
                    coin: isLiquidJetton ? t('staking.send_staked_ton') : currencyTitle,
                  })}
            </Text>
          </S.Center>
          <Spacer y={32} />
          <S.Table>
            {recipientName ? (
              <S.Item>
                <S.ItemLabel>{t('confirm_sending_recipient')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue numberOfLines={1}>{recipientName}</S.ItemValue>
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
                  <S.ItemValue numberOfLines={1}>
                    {Address.toShort(recipient.address, 4)}
                  </S.ItemValue>
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('confirm_sending_amount')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue numberOfLines={1}>{amountValue}</S.ItemValue>
                {fiatValue.formatted.totalFiat ? (
                  <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                ) : null}
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('confirm_sending_fee')}</S.ItemLabel>
              <S.ItemContent>
                {fee === '0' || isPreparing ? (
                  <S.ItemSkeleton>
                    <SkeletonLine />
                  </S.ItemSkeleton>
                ) : (
                  <S.ItemValue numberOfLines={1}>{feeValue}</S.ItemValue>
                )}
                {fee !== '0' && !isPreparing ? (
                  <S.ItemSubValue>≈ {fiatFee.formatted.totalFiat}</S.ItemSubValue>
                ) : null}
              </S.ItemContent>
            </S.Item>
            {comment.length > 0 ? (
              <>
                <Separator />
                <S.Item>
                  <S.ItemInline>
                    <S.ItemLabel>
                      {t('send_screen_steps.comfirm.comment_label')}
                    </S.ItemLabel>
                    {isCommentEncrypted ? (
                      <>
                        <Spacer x={4} />
                        <Icon name="ic-lock-16" color="accentPositive" />
                      </>
                    ) : null}
                  </S.ItemInline>
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
          {isLiquidJetton ? (
            <>
              <Spacer y={16} />
              <S.WarningContainer>
                <S.WarningTouchable
                  background="backgroundQuaternary"
                  onPress={openInactiveInfo}
                >
                  <S.WarningContent>
                    <Text variant="label1">{t('confirm_sending_liquid_warn_title')}</Text>
                    <Text variant="body2" color="foregroundSecondary">
                      {t('confirm_sending_liquid_warn_description')}
                    </Text>
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
          disabled={isPreparing || !active}
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
