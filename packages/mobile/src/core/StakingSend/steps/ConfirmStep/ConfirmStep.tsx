import { useFiatValue, useTranslator } from '$hooks';
import { Separator, Spacer, Text } from '$uikit';
import React, { FC, memo } from 'react';
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
import { getImplementationIcon, getPoolIcon, truncateDecimal } from '$utils';
import { PoolInfo } from '@tonkeeper/core';
import { Address } from '$libs/Ton';

interface Props extends StepComponentProps {
  transactionType: StakingTransactionType;
  pool: PoolInfo;
  totalFee?: string;
  amount: SendAmount;
  stepsScrollTop: SharedValue<Record<StakingSendSteps, number>>;
  sendTx: () => Promise<void>;
}

const getActionName = (
  transactionType: StakingTransactionType,
  t: ReturnType<typeof useTranslator>,
) => {
  switch (transactionType) {
    case StakingTransactionType.WITHDRAWAL:
      return t('staking.withdrawal_request');
    case StakingTransactionType.WITHDRAWAL_CONFIRM:
      return t('staking.withdrawal_confrim');
    case StakingTransactionType.DEPOSIT:
    default:
      return t('staking.deposit');
  }
};

const ConfirmStepComponent: FC<Props> = (props) => {
  const { transactionType, active, pool, totalFee, amount, stepsScrollTop, sendTx } =
    props;

  const address = new Address(pool.address);

  const fiatValue = useFiatValue(CryptoCurrencies.Ton, amount.value);
  const fiatFee = useFiatValue(CryptoCurrencies.Ton, totalFee || '0');

  const { bottom: bottomInset } = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [StakingSendSteps.CONFIRM]: event.contentOffset.y,
    };
  });

  const t = useTranslator();

  const { footerRef, onConfirm } = useActionFooter();

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    startLoading();

    await sendTx();
  });

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
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.recipient.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{pool.name}</S.ItemValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.address.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{address.format({ cut: true })}</S.ItemValue>
              </S.ItemContent>
            </S.Item>
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
                      {t('staking.confirm.withdraw_amount.value', {
                        value: fiatValue.amount,
                      })}
                    </S.ItemValue>
                    <S.ItemSubValue>≈ {fiatValue.fiatInfo.amount}</S.ItemSubValue>
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
                      {t('staking.confirm.amount.value', { value: fiatValue.amount })}
                    </S.ItemValue>
                    <S.ItemSubValue>≈ {fiatValue.fiatInfo.amount}</S.ItemSubValue>
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
                  <S.ItemSubValue>≈ {fiatFee.fiatInfo.amount}</S.ItemSubValue>
                </S.ItemContent>
              </S.Item>
            ) : null}
          </S.Table>
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
