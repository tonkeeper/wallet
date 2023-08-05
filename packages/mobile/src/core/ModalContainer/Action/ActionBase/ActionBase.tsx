import React, { FC, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

import * as S from './ActionBase.style';
import { Highlight, Icon, Separator, Spacer, SpoilerView, Text } from '$uikit';
import { ns } from '$utils';
import { ActionBaseProps, InfoRows } from './ActionBase.interface';
import { openDAppBrowser, openSubscription } from '$navigation';
import { getServerConfig } from '$shared/constants';
import { Modal } from '@tonkeeper/uikit';
import { Toast } from '$store';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { t } from '@tonkeeper/shared/i18n';

export const ActionBase: FC<ActionBaseProps> = ({
  infoRows,
  head,
  isSpam,
  isFailed,
  shouldShowOpenSubscriptionButton,
  subscriptionInfo,
  isInProgress,
  label,
  sentLabel,
  eventId,
  fiatValue,
  encryptedComment,
  decryptedComment,
  handleDecryptComment,
}) => {
  const [isClosed, setClosed] = useState(false);

  const isCommentRow = useCallback(
    (item: InfoRows[0]) => item.label === t('transaction_message'),
    [t],
  );

  const handlePress = useCallback(
    (item: InfoRows[0]) => () => {
      let value = item.value as string;

      if (isCommentRow(item)) {
        if (encryptedComment && !decryptedComment) {
          return;
        }
        if (decryptedComment) {
          value = decryptedComment;
        }
      }

      Clipboard.setString(value);
      Toast.success(t('copied'));
    },
    [decryptedComment, encryptedComment, isCommentRow, t],
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

  const encryptedCommentLength = encryptedComment
    ? encryptedComment.cipherText.length / 2 - 64
    : 0;

  const encryptedCommentMock = 's'.repeat(encryptedCommentLength);

  function renderEncryptedComment(item: InfoRows[0]) {
    return (
      <S.ItemContent>
        <TouchableWithoutFeedback
          onPress={decryptedComment ? handlePress(item) : handleDecryptComment}
        >
          <S.EncryptedCommentContainer>
            <SpoilerView isOn={!decryptedComment}>
              <S.EncryptedCommentText>
                {decryptedComment ?? encryptedCommentMock}
              </S.EncryptedCommentText>
            </SpoilerView>
          </S.EncryptedCommentContainer>
        </TouchableWithoutFeedback>
      </S.ItemContent>
    );
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
              <>
                <Text variant="h2" textAlign="center">
                  {label}
                </Text>
                {fiatValue && (
                  <>
                    <Spacer y={4} />
                    <Text color="textSecondary" variant="body1">
                      {fiatValue}
                    </Text>
                    <Spacer y={2} />
                  </>
                )}
              </>
            )}
            <S.TypeLabelWrapper>
              <Text textAlign="center" color="foregroundSecondary" variant="body1">
                {sentLabel}
              </Text>
            </S.TypeLabelWrapper>
            {isFailed && (
              <Text variant="body1" color="accentOrange">
                {t('activity.failed_transaction')}
              </Text>
            )}
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
                  <S.ItemInline>
                    <S.ItemLabel numberOfLines={1}>{item.label}</S.ItemLabel>
                    {isCommentRow(item) && encryptedComment ? (
                      <>
                        <Spacer x={4} />
                        <S.EncryptedIcon />
                      </>
                    ) : null}
                  </S.ItemInline>
                  <S.ItemValueWrapper>
                    {isCommentRow(item) && encryptedComment ? (
                      renderEncryptedComment(item)
                    ) : (
                      <S.ItemValue>{item.preparedValue || item.value}</S.ItemValue>
                    )}

                    {item.subvalue && (
                      <Text variant="body2" color="textSecondary">
                        {item.subvalue}
                      </Text>
                    )}
                  </S.ItemValueWrapper>
                </S.Item>
              </Highlight>,
            ])}
          </S.Table>
          <View style={styles.buttonContainer}>{renderFooterButton()}</View>
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 16,
  },
});
