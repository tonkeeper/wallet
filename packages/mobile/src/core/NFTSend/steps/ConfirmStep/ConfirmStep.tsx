import React, { FC, memo } from 'react';
import { useCopyText } from '$hooks/useCopyText';
import { useFiatValue } from '$hooks/useFiatValue';
import { Highlight, Icon, Separator, Spacer, Text } from '$uikit';
import * as S from './ConfirmStep.style';
import { BottomButtonWrapHelper, StepScrollView } from '$shared/components';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StakingSendSteps } from '$core/StakingSend/types';
import {
  ActionFooter,
  useActionFooter,
} from '$core/ModalContainer/NFTOperations/NFTOperationFooter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CryptoCurrencies } from '$shared/constants';
import { t } from '@tonkeeper/shared/i18n';
import { SkeletonLine } from '$uikit/Skeleton/SkeletonLine';
import { AccountWithPubKey, SendRecipient } from '$core/Send/Send.interface';
import { Address } from '@tonkeeper/core';
import { truncateDecimal } from '$utils';
import { BatteryState } from '@tonkeeper/shared/utils/battery';
import { useBatteryState } from '@tonkeeper/shared/query/hooks/useBatteryState';
import { tk } from '$wallet';
import { Steezy, WalletIcon, isAndroid } from '@tonkeeper/uikit';

interface Props extends StepComponentProps {
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountWithPubKey | null;
  total: { amount: string; isRefund: boolean };
  nftName?: string;
  nftCollection?: string;
  nftIcon?: string;
  stepsScrollTop: SharedValue<Record<StakingSendSteps, number>>;
  isPreparing: boolean;
  isBattery: boolean;
  isCommentEncrypted: boolean;
  comment: string;
  sendTx: () => Promise<void>;
}

const ConfirmStepComponent: FC<Props> = (props) => {
  const {
    recipient,
    recipientAccountInfo,
    active,
    nftName,
    nftIcon,
    nftCollection,
    isBattery,
    comment,
    total,
    stepsScrollTop,
    isPreparing,
    isCommentEncrypted,
    sendTx,
  } = props;

  const fiatFee = useFiatValue(CryptoCurrencies.Ton, total?.amount || '0');
  const batteryState = useBatteryState();

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

  if (!recipient) {
    return null;
  }

  const recipientName = recipient.domain || recipient.name || recipientAccountInfo?.name;

  return (
    <S.Container>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Content>
          <S.Center>
            <S.IconContainer>
              <S.Icon source={{ uri: nftIcon }} />
            </S.IconContainer>
            <Spacer y={20} />
            <Text numberOfLines={1} color="foregroundSecondary">
              {nftName}
              {nftName && nftCollection && ' · '}
              {nftCollection}
            </Text>
            <Spacer y={4} />
            <Text variant="h3">{t('nft_transfer.title')}</Text>
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
            {recipientName ? (
              <S.Item>
                <S.ItemLabel>{t('confirm_sending_recipient')}</S.ItemLabel>
                <S.ItemContent>
                  <S.ItemValue numberOfLines={1}>{recipientName}</S.ItemValue>
                </S.ItemContent>
              </S.Item>
            ) : null}
            <Separator />
            <Highlight onPress={() => copyText(recipient.address, t('address_copied'))}>
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
            <S.ItemRowContainer>
              <S.ItemRow>
                <S.ItemLabel>
                  {total.isRefund
                    ? t('nft_transfer.confirm.fee.refund_label')
                    : t('nft_transfer.confirm.fee.label')}
                </S.ItemLabel>
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
                      {t('nft_transfer.confirm.fee.value', {
                        value: total.amount ? truncateDecimal(total.amount, 1) : '?',
                      })}
                    </S.ItemValue>
                  </>
                )}
              </S.ItemRow>
              <S.ItemRow>
                {isBattery ? (
                  <Text color={'textTertiary'} variant={'body2'}>
                    {t('send_screen_steps.comfirm.will_be_paid_with_battery')}
                  </Text>
                ) : (
                  <Text color={'textTertiary'} variant={'body2'} />
                )}
                <S.ItemSubValue>
                  {total?.amount ? `≈ ${fiatFee.formatted.totalFiat}` : ' '}
                </S.ItemSubValue>
              </S.ItemRow>
            </S.ItemRowContainer>
            {comment.length > 0 ? (
              <>
                <Separator />
                <Highlight onPress={() => copyText(comment)}>
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
        </S.Content>
        <BottomButtonWrapHelper />
      </StepScrollView>
      <S.FooterContainer bottomInset={bottomInset}>
        <ActionFooter
          withCloseButton={false}
          disabled={isPreparing}
          confirmTitle={t('confirm_sending_submit')}
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
