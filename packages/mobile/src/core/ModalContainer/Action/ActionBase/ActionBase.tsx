import React, { FC, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

import * as S from './ActionBase.style';
import { Highlight, Icon, Separator, Text } from '$uikit';
import { ns } from '$utils';
import { ActionBaseProps } from './ActionBase.interface';
import { useTranslator } from '$hooks';
import { openDAppBrowser, openSubscription } from '$navigation';
import { getServerConfig } from '$shared/constants';
import { Modal } from '$libs/navigation';
import { Toast } from '$store';

export const ActionBase: FC<ActionBaseProps> = ({
  infoRows,
  head,
  isSpam,
  shouldShowOpenSubscriptionButton,
  subscriptionInfo,
  isInProgress,
  label,
  sentLabel,
  eventId,
}) => {
  const [isClosed, setClosed] = useState(false);
  const t = useTranslator();

  const handlePress = useCallback(
    (item) => () => {
      Clipboard.setString(item.value);
      Toast.success(t('copied'));
    },
    [t],
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

  const handleOpenInExplorer = useCallback(() => {
    openDAppBrowser(getServerConfig('transactionExplorer').replace('%s', eventId));
  }, [eventId]);

  function renderFooterButton() {
    if (shouldShowOpenSubscriptionButton) {
      return (
        <S.SendButton onPress={handleOpenSubscription}>
          {t('transaction_show_subscription_button')}
        </S.SendButton>
      );
    } else {
      return (
        <S.SendButton onPress={handleOpenInExplorer}>
          {t('transaction_view_in_explorer')}
        </S.SendButton>
      );
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
          <View style={styles.buttonContainer}>
            {renderFooterButton()}
          </View>
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 16
  }
});