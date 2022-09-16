import React from 'react';
import { t } from '$translation';
import { BottomSheet, Button, Icon, Text } from '$uikit';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import * as S from './ReminderEnableNotificationsModal.styles'
import { useNotifications } from '$hooks/useNotifications';
import { removeReminderNotifications, saveDontShowReminderNotifications, saveReminderNotifications } from '$utils/messaging';

export const ReminderEnableNotificationsModal = () => {
  const notifications = useNotifications();
  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  const closeBottomSheet = () => bottomSheetRef.current?.close(); 

  React.useEffect(() => {
    saveDontShowReminderNotifications();
  }, []);

  const handleEnable = React.useCallback(async () => {
    const isSubscribe = await notifications.subscribe();
    if (isSubscribe) {
      removeReminderNotifications();
      closeBottomSheet();
    }
  }, []);

  const handleLater = React.useCallback(async () => {
    saveReminderNotifications();
    closeBottomSheet();
  }, []);
  
  return (
    <BottomSheet skipHeader ref={bottomSheetRef} onClosePress={handleLater}>
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
        <Button mode="secondary" onPress={handleLater} >
          {t('reminder_notifications_later_button')}
        </Button>
      </S.Footer>
    </BottomSheet>
  );
};
