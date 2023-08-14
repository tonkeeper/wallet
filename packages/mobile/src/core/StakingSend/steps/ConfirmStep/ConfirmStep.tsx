import { useCopyText } from '$hooks/useCopyText';
import { useFiatValue } from '$hooks/useFiatValue';
import { Highlight, Separator, Spacer, Text } from '$uikit';
import React, { FC, memo, useCallback, useMemo } from 'react';
import * as S from './ConfirmStep.style';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { SendAmount } from '$core/Send/Send.interface';
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StakingSendSteps, StakingTransactionType } from '$core/StakingSend/types';
import {
  ActionFooter,
  useActionFooter,
} from '$core/ModalContainer/NFTOperations/NFTOperationFooter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CryptoCurrencies } from '$shared/constants';
import { parseLocaleNumber, truncateDecimal } from '$utils';
import { getImplementationIcon, getPoolIcon } from '$utils/staking';
import { PoolInfo } from '@tonkeeper/core/src/legacy';
import { stakingFormatter } from '$utils/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/shared/Address';

interface Props extends StepComponentProps {
  transactionType: StakingTransactionType;
  pool: PoolInfo;
  totalFee?: string;
  amount: SendAmount;
  symbol: string;
  currency: CryptoCurrencies;
  decimals: number;
  isJetton: boolean;
  stepsScrollTop: SharedValue<Record<StakingSendSteps, number>>;
  sendTx: () => Promise<void>;
}

const getActionName = (transactionType: StakingTransactionType, t: any) => {
  switch (transactionType) {
    case StakingTransactionType.WITHDRAWAL:
      return t('staking.withdrawal_request');
    case StakingTransactionType.WITHDRAWAL_CONFIRM:
      return t('staking.get_withdrawal');
    case StakingTransactionType.DEPOSIT:
    default:
      return t('staking.deposit');
  }
};

const ConfirmStepComponent: FC<Props> = (props) => {
  const {
    transactionType,
    active,
    pool,
    totalFee,
    amount,
    symbol,
    currency,
    decimals,
    isJetton,
    stepsScrollTop,
    sendTx,
  } = props;

  const isWithdrawalConfrim =
    transactionType === StakingTransactionType.WITHDRAWAL_CONFIRM;

  const address = useMemo(() => Address.parse(pool.address), [pool.address]);

  const fiatValue = useFiatValue(
    currency,
    parseLocaleNumber(amount.value),
    decimals,
    isJetton,
    symbol,
  );
  const fiatFee = useFiatValue(CryptoCurrencies.Ton, totalFee || '0');

  const { bottom: bottomInset } = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [StakingSendSteps.CONFIRM]: event.contentOffset.y,
    };
  });

  const { footerRef, onConfirm } = useActionFooter();

  const copyText = useCopyText();

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    startLoading();

    await sendTx();
  });

  const handleCopyAddress = useCallback(() => {
    copyText(address.toFriendly(), t('address_copied'));
  }, [address, copyText, t]);

  const handleCopyPoolName = useCallback(
    () => copyText(pool.name),
    [copyText, pool.name],
  );

  const actionName = getActionName(transactionType, t);

  const icon = getPoolIcon(pool) ?? getImplementationIcon(pool.implementation);

  return (
    <S.Container>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Content>
          <S.Center>
            <S.IconContainer>
              <S.Icon source={icon} />
            </S.IconContainer>
            <Spacer y={20} />
            <Text color="foregroundSecondary">{t('staking.transaction')}</Text>
            <Spacer y={4} />
            <Text variant="h3">{actionName}</Text>
          </S.Center>
          <Spacer y={32} />
          <S.Table>
            <Highlight onPress={handleCopyPoolName}>
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.recipient.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>{pool.name}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            <Highlight onPress={handleCopyAddress}>
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.address.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>{address.toShort()}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            {[
              StakingTransactionType.WITHDRAWAL,
              StakingTransactionType.WITHDRAWAL_CONFIRM,
            ].includes(transactionType) ? (
              <>
                <S.Item>
                  <S.ItemLabel>{t('staking.confirm.withdraw_amount.label')}</S.ItemLabel>
                  <S.ItemContent>
                    <S.ItemValue>
                      {stakingFormatter.format(fiatValue.amount)} {fiatValue.symbol}
                    </S.ItemValue>
                    <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                  </S.ItemContent>
                </S.Item>
                <Separator />
              </>
            ) : (
              <>
                <S.Item>
                  <S.ItemLabel>{t('staking.confirm.amount.label')}</S.ItemLabel>
                  <S.ItemContent>
                    <S.ItemValue>
                      {stakingFormatter.format(fiatValue.amount)} {fiatValue.symbol}
                    </S.ItemValue>
                    <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                  </S.ItemContent>
                </S.Item>
                <Separator />
              </>
            )}
            {totalFee ? (
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.fee.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>
                    {t('staking.confirm.fee.value', {
                      value: truncateDecimal(totalFee, 1),
                    })}
                  </S.ItemValue>
                  <S.ItemSubValue>≈ {fiatFee.formatted.totalFiat}</S.ItemSubValue>
                </S.ItemContent>
              </S.Item>
            ) : null}
          </S.Table>
        </S.Content>
        <BottomButtonWrapHelper />
      </StepScrollView>
      <S.FooterContainer bottomInset={bottomInset}>
        <ActionFooter
          withCloseButton={isWithdrawalConfrim}
          confirmTitle={t(isWithdrawalConfrim ? 'confirm' : 'confirm_sending_submit')}
          onPressConfirm={handleConfirm}
          ref={footerRef}
        />
      </S.FooterContainer>
    </S.Container>
  );
};

export const ConfirmStep = memo(ConfirmStepComponent);
