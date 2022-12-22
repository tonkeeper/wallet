import React, { FC, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';

import * as S from './ActionBase.style';
import { BottomSheet, Highlight, Icon, Separator, Text } from '$uikit';
import { ns } from '$utils';
import { toastActions } from '$store/toast';
import { ActionBaseProps } from './ActionBase.interface';
import { useTranslator } from '$hooks';
import { openSend, openSubscription } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';
import { Modal } from '$libs/navigation';

export const ActionBase: FC<ActionBaseProps> = ({
  infoRows,
  head,
  isSpam,
  comment,
  recipientAddress,
  shouldShowSendToRecipientButton,
  shouldShowOpenSubscriptionButton,
  subscriptionInfo,
  isInProgress,
  label,
  sentLabel,
  jettonAddress,
}) => {
  const dispatch = useDispatch();
  const [isClosed, setClosed] = useState(false);
  const t = useTranslator();

  const handlePress = useCallback(
    (item) => () => {
      Clipboard.setString(item.value);
      dispatch(toastActions.success(t('copied')));
    },
    [dispatch, t],
  );

  const handleOpenSubscription = useCallback(() => {
    setClosed(true);
    setTimeout(() => {
      if (!subscriptionInfo) {
        return;
      }
      openSubscription(subscriptionInfo);
    }, 500);
  }, [subscriptionInfo]);

  const handleSendMore = useCallback(() => {
    setClosed(true);
    setTimeout(() => {
      openSend(
        jettonAddress || CryptoCurrencies.Ton,
        recipientAddress,
        comment,
        true,
        !!jettonAddress,
      );
    }, 500);
  }, [comment, jettonAddress, recipientAddress]);

  function renderFooterButton() {
    if (shouldShowOpenSubscriptionButton) {
      return (
        <S.SendButton onPress={handleOpenSubscription}>
          {t('transaction_show_subscription_button')}
        </S.SendButton>
      );
    } else if (shouldShowSendToRecipientButton) {
      return (
        <S.SendButton onPress={handleSendMore}>
          {t('transaction_send_more_button')}
        </S.SendButton>
      );
    } else {
      return null;
    }
  }

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View
          style={{
            padding: ns(16),
            paddingBottom: 0,
          }}
        >
          <S.InfoWrap>
            {isSpam && (
              <S.SpamWrap>
                <S.SpamBadge>
                  <Text variant="label2" color="foregroundPrimary">
                    {t('spam_action').toUpperCase()}
                  </Text>
                </S.SpamBadge>
              </S.SpamWrap>
            )}
            {head || (
              <Text variant="h2" textAlign="center">
                {label}
              </Text>
            )}
            <S.TypeLabelWrapper>
              <Text textAlign="center" color="foregroundSecondary" variant="body1">
                {sentLabel}
              </Text>
            </S.TypeLabelWrapper>
            {isInProgress && (
              <S.Pending>
                <Icon name="ic-time-16" color="foregroundSecondary" />
                <S.PendingTextWrapper>
                  <Text color="foregroundSecondary" variant="label1">
                    {t('transaction_type_pending')}
                  </Text>
                </S.PendingTextWrapper>
              </S.Pending>
            )}
          </S.InfoWrap>
          <S.Table>
            {infoRows.map((item, i) => [
              i > 0 && <Separator key={'sep_' + item.label} />,
              <Highlight key={item.label} onPress={handlePress(item)}>
                <S.Item>
                  <S.ItemLabel numberOfLines={1}>{item.label}</S.ItemLabel>
                  <S.ItemValue>{item.preparedValue || item.value}</S.ItemValue>
                </S.Item>
              </Highlight>,
            ])}
          </S.Table>
          {renderFooterButton()}
        </View>
      </Modal.Content>
    </Modal>
  );
};
