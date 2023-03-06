import { useFiatValue, useTranslator } from '$hooks';
import { Separator, Spacer, Text } from '$uikit';
import React, { FC, memo } from 'react';
import * as S from './ConfirmStep.style';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { SendAmount } from '$core/Send/Send.interface';
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StakingTopUpSteps } from '$core/StakingTopUp/types';
import {
  ActionFooter,
  useActionFooter,
} from '$core/ModalContainer/NFTOperations/NFTOperationFooter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { whalesIconSource } from '$assets/staking';
import { CryptoCurrencies } from '$shared/constants';

interface Props extends StepComponentProps {
  message: string;
  amount: SendAmount;
  stepsScrollTop: SharedValue<Record<StakingTopUpSteps, number>>;
  sendTx: () => Promise<void>;
}

const ConfirmStepComponent: FC<Props> = (props) => {
  const { active, message, amount, stepsScrollTop, sendTx } = props;

  const fiatValue = useFiatValue(CryptoCurrencies.Ton, amount.value);
  const fiatFee = useFiatValue(CryptoCurrencies.Ton, '0.207');

  const poolName = 'Tonkeeper #1';

  const { bottom: bottomInset } = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [StakingTopUpSteps.CONFIRM]: event.contentOffset.y,
    };
  });

  const t = useTranslator();

  const { footerRef, onConfirm } = useActionFooter();

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    startLoading();

    await sendTx();
  });

  return (
    <S.Container>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Content>
          <S.Center>
            <S.IconContainer>
              <S.Icon source={whalesIconSource} />
            </S.IconContainer>
            <Spacer y={20} />
            <Text color="foregroundSecondary">{t('staking.confirm_action')}</Text>
            <Spacer y={4} />
            <Text variant="h3">{t('staking.deposit')}</Text>
          </S.Center>
          <Spacer y={32} />
          <S.Table>
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.recipient.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{poolName}</S.ItemValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.address.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{poolName}</S.ItemValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
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
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.fee.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>
                  {t('staking.confirm.fee.value', { value: fiatFee.amount })}
                </S.ItemValue>
                <S.ItemSubValue>≈ {fiatFee.fiatInfo.amount}</S.ItemSubValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.message.label')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{message}</S.ItemValue>
              </S.ItemContent>
            </S.Item>
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
