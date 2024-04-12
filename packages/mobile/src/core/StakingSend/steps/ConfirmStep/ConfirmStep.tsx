import { useCopyText } from '$hooks/useCopyText';
import { useFiatValue } from '$hooks/useFiatValue';
import { Highlight, Separator, Spacer, Text } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
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
import { stakingFormatter } from '$utils/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { SkeletonLine } from '$uikit/Skeleton/SkeletonLine';
import { tk } from '$wallet';
import { Steezy, WalletIcon, isAndroid } from '@tonkeeper/uikit';

interface Props extends StepComponentProps {
  transactionType: StakingTransactionType;
  pool: PoolInfo;
  totalFee?: string;
  amount: SendAmount;
  decimals: number;
  stepsScrollTop: SharedValue<Record<StakingSendSteps, number>>;
  isPreparing: boolean;
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
    decimals,
    stepsScrollTop,
    isPreparing,
    sendTx,
  } = props;

  const isWithdrawalConfrim =
    transactionType === StakingTransactionType.WITHDRAWAL_CONFIRM;

  const isDeposit = transactionType === StakingTransactionType.DEPOSIT;

  const fiatValue = useFiatValue(
    CryptoCurrencies.Ton,
    parseLocaleNumber(amount.value),
    decimals,
    'TON',
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
            {tk.wallets.size > 1 && (
              <>
                <S.Item>
                  <S.ItemLabel>{t('send_screen_steps.comfirm.wallet')}</S.ItemLabel>
                  <S.ItemContent>
                    <S.WalletNameRow>
                      <WalletIcon
                        emojiStyle={styles.emoji.static}
                        size={20}
                        value={tk.wallet.config.emoji}
                      />
                      <Spacer x={4} />
                      <S.ItemValue numberOfLines={1}>{tk.wallet.config.name}</S.ItemValue>
                    </S.WalletNameRow>
                  </S.ItemContent>
                </S.Item>
                <Separator />
              </>
            )}
            <Highlight onPress={handleCopyPoolName}>
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.recipient.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>{pool.name}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            </Highlight>
            <Separator />
            {[
              StakingTransactionType.WITHDRAWAL,
              StakingTransactionType.WITHDRAWAL_CONFIRM,
            ].includes(transactionType) ? (
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.withdraw_amount.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>
                    {stakingFormatter.format(fiatValue.amount)} {fiatValue.symbol}
                  </S.ItemValue>
                  <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                </S.ItemContent>
              </S.Item>
            ) : (
              <S.Item>
                <S.ItemLabel>{t('staking.confirm.amount.label')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue>
                    {stakingFormatter.format(fiatValue.amount)} {fiatValue.symbol}
                  </S.ItemValue>
                  <S.ItemSubValue>≈ {fiatValue.formatted.totalFiat}</S.ItemSubValue>
                </S.ItemContent>
              </S.Item>
            )}
            <Separator />
            <S.Item>
              <S.ItemLabel>{t('staking.confirm.fee.label')}</S.ItemLabel>
              <S.ItemContent>
                {isPreparing ? (
                  <>
                    <S.ItemSkeleton>
                      <SkeletonLine height={20} />
                    </S.ItemSkeleton>
                    <Spacer y={4} />
                    <S.ItemSkeleton>
                      <SkeletonLine width={50} />
                    </S.ItemSkeleton>
                  </>
                ) : (
                  <>
                    <S.ItemValue numberOfLines={1}>
                      {t('staking.confirm.fee.value', {
                        value: totalFee ? truncateDecimal(totalFee, 1) : '?',
                      })}
                    </S.ItemValue>
                    <S.ItemSubValue>
                      {totalFee ? `≈ ${fiatFee.formatted.totalFiat}` : ' '}
                    </S.ItemSubValue>
                  </>
                )}
              </S.ItemContent>
            </S.Item>
          </S.Table>
        </S.Content>
        <BottomButtonWrapHelper />
      </StepScrollView>
      <S.FooterContainer bottomInset={bottomInset}>
        <ActionFooter
          withCloseButton={isWithdrawalConfrim}
          disabled={isPreparing}
          confirmTitle={t(
            isWithdrawalConfrim
              ? 'confirm'
              : isDeposit
              ? 'staking.confirm_deposit'
              : 'staking.confirm_unstake',
          )}
          onPressConfirm={handleConfirm}
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
