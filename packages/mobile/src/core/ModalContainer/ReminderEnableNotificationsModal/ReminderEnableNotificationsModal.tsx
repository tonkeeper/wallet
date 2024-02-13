import React from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Button, Icon, Text } from '$uikit';
import * as S from './ReminderEnableNotificationsModal.styles';
import { useNotifications } from '$hooks/useNotifications';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Modal, View } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';

export const ReminderEnableNotificationsModal = () => {
  const nav = useNavigation();
  const notifications = useNotifications();

  const handleEnable = React.useCallback(async () => {
    const isSubscribe = await notifications.subscribe();
    if (isSubscribe) {
      nav.goBack();
    }
  }, []);

  const handleLater = React.useCallback(async () => {
    nav.goBack();
  }, []);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
          <S.Wrap>
            <S.Content>
              <S.IconWrap>
                <Icon name="ic-notification-128" color="accentPrimary" />
              </S.IconWrap>
              <Text
                variant="h2"
                lineHeight={32}
                style={{ textAlign: 'center', marginBottom: 4 }}
              >
                {t('reminder_notifications_title')}
              </Text>
              <Text
                color="foregroundSecondary"
                variant="body1"
                lineHeight={24}
                style={{ textAlign: 'center' }}
              >
                {t('reminder_notifications_caption')}
              </Text>
            </S.Content>
          </S.Wrap>
          <S.Footer>
            <Button style={{ marginBottom: 16 }} onPress={handleEnable}>
              {t('reminder_notifications_enable_button')}
            </Button>
            <Button mode="secondary" onPress={handleLater}>
              {t('reminder_notifications_later_button')}
            </Button>
          </S.Footer>
        </View>
      </Modal.Content>
    </Modal>
  );
};

export async function openReminderEnableNotificationsModal() {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ReminderEnableNotificationsModal,
    params: {},
    path: 'MARKETPLACES',
  });
}
