import { useCopyText } from '$hooks/useCopyText';
import { useFiatValue } from '$hooks/useFiatValue';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { Highlight, Icon, Separator, Spacer, StakedTonIcon, Text } from '$uikit';
import { parseLocaleNumber } from '$utils';
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
import { SkeletonLine } from '$uikit/Skeleton/SkeletonLine';
import { t } from '@tonkeeper/shared/i18n';
import { openInactiveInfo } from '$core/ModalContainer/InfoAboutInactive/InfoAboutInactive';
import { Address } from '@tonkeeper/core';
import { useBatteryState } from '@tonkeeper/shared/query/hooks/useBatteryState';
import { BatteryState } from '@tonkeeper/shared/utils/battery';
import { TokenType } from '$core/Send/Send.interface';
import { useBalancesState, useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { Steezy, WalletIcon, isAndroid } from '@tonkeeper/uikit';

const ConfirmStepComponent: FC<ConfirmStepProps> = (props) => {
  const {
    currency,
    currencyTitle,
    recipient,
    recipientAccountInfo,
    decimals,
    tokenType,
    isPreparing,
    fee,
    active,
    isInactive,
    isBattery,
    amount,
    comment,
    isCommentEncrypted,
    onConfirm: sendTx,
    redirectToActivity,
  } = props;

  const { footerRef, onConfirm } = useActionFooter();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const copyText = useCopyText();

  const balances = useBalancesState();
  const wallet = useWallet();
  const batteryState = useBatteryState();

  const { Logo, liquidJettonPool } = useCurrencyToSend(currency, tokenType);

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
        wallet.isLockup &&
        !amount.all &&
        new BigNumber(balances.ton).isLessThan(amountWithFee)
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

  const feeCurrency = CryptoCurrencies.Ton;

  const calculatedValue = useMemo(() => {
    if (amount.all && tokenType === TokenType.TON) {
      return new BigNumber(parseLocaleNumber(amount.value)).minus(fee).toString();
    }

    return parseLocaleNumber(amount.value);
  }, [amount.all, amount.value, fee, tokenType]);

  const fiatValue = useFiatValue(currency as CryptoCurrency, calculatedValue, decimals);

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
    if (amount.all && tokenType === TokenType.TON) {
      return `≈ ${value}`;
    }

    return value;
  }, [calculatedValue, decimals, currencyTitle, amount.all, tokenType]);

  const handleCopy = useCallback(
    (text: string, toastText?: string) => () => {
      copyText(text, toastText);
    },
    [copyText],
  );

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
                    coin: currencyTitle,
                  })}
            </Text>
          </S.Center>
          <Spacer y={32} />
          <S.Table>
            {tk.wallets.size > 1 && (
              <>
                <S.Item>
                  <S.ItemLabel>{t('send_screen_steps.comfirm.wallet')}</S.ItemLabel>
                  <S.ItemContent>
                    <S.WalletNameRow>
                      <WalletIcon
                        emojiStyle={styles.emoji.static}
                        size={20}
                        value={wallet.config.emoji}
                      />
                      <Spacer x={4} />
                      <S.ItemValue numberOfLines={1}>{tk.wallet.config.name}</S.ItemValue>
                    </S.WalletNameRow>
                  </S.ItemContent>
                </S.Item>
                <Separator />
              </>
            )}
            {recipientName ? (
              <>
                <S.Item>
                  <S.ItemLabel>{t('confirm_sending_recipient')}</S.ItemLabel>
                  <S.ItemContent>
                    <S.ItemValue numberOfLines={1}>{recipientName}</S.ItemValue>
                  </S.ItemContent>
                </S.Item>
                <Separator />
              </>
            ) : null}
            <Highlight onPress={handleCopy(recipient.address, t('address_copied'))}>
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
            <Highlight
              onPress={handleCopy(formatter.format(calculatedValue, { decimals }))}
            >
              <S.Item>
                <S.ItemLabel>{t('confirm_sending_amount')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue numberOfLines={1}>{amountValue}</S.ItemValue>
                  {fiatValue.formatted.totalFiat ? (
                    <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                  ) : null}
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            <S.ItemRowContainer>
              <S.ItemRow>
                <S.ItemLabel>{t('confirm_sending_fee')}</S.ItemLabel>
                {isPreparing ? (
                  <S.ItemSkeleton>
                    <SkeletonLine />
                  </S.ItemSkeleton>
                ) : (
                  <S.ItemValue numberOfLines={1}>{feeValue}</S.ItemValue>
                )}
              </S.ItemRow>
              <S.ItemRow>
                {isBattery ? (
                  <S.ItemSubLabel>
                    {t('send_screen_steps.comfirm.will_be_paid_with_battery')}
                  </S.ItemSubLabel>
                ) : (
                  <S.ItemSubLabel />
                )}
                {fee !== '0' && !isPreparing ? (
                  <S.ItemSubValue>≈ {fiatFee.formatted.totalFiat}</S.ItemSubValue>
                ) : null}
              </S.ItemRow>
            </S.ItemRowContainer>
            {comment.length > 0 ? (
              <>
                <Separator />
                <Highlight onPress={handleCopy(comment)}>
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
                </Highlight>
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
          disabled={isPreparing || !active}
          withCloseButton={false}
          confirmTitle={t('confirm_sending_submit')}
          onPressConfirm={handleConfirm}
          redirectToActivity={redirectToActivity}
          ref={footerRef}
        />
      </S.FooterContainer>
    </S.Container>
  );
};

export const ConfirmStep = memo(ConfirmStepComponent);

const styles = Steezy.create({
  emoji: {
    fontSize: isAndroid ? 17 : 20,
    marginTop: isAndroid ? -1 : 1,
  },
});
