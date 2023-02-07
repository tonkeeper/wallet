import React, { memo, useCallback, useEffect } from 'react';
import { t } from '$translation';
import { Modal, useNavigation } from '$libs/navigation';
import { push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { MainDB } from '$database';
import { mainActions } from '$store/main';
import { useDispatch } from 'react-redux';
import { Button, Icon, Text } from '$uikit';
import * as S from './TimeNotSynced.style';
import { Linking, Platform } from 'react-native';
import { Base64, delay } from '$utils';

export const TimeNotSyncedModal = memo(() => {
  const dispatch = useDispatch();
  const nav = useNavigation();

  useEffect(() => {
    MainDB.setTimeSyncedDismissed(false);
    dispatch(mainActions.setTimeSyncedDismissed(false));
  }, []);

  const handleOpenSettings = useCallback(async () => {
    nav.goBack();
    await delay(400);
    if (Platform.OS === 'ios') {
      return Linking.openURL(Base64.decodeToStr('QXBwLXByZWZzOnJvb3Q='));
    }
    Linking.sendIntent('android.settings.DATE_SETTINGS');
  }, []);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <S.Wrap>
          <Icon style={{ marginBottom: 12 }} name={'ic-exclamationmark-circle-84'} />
          <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
            {t('txActions.signRaw.wrongTime.title')}
          </Text>
          <Text variant="body1" color="foregroundSecondary" textAlign="center">
            {t('txActions.signRaw.wrongTime.description')}
          </Text>
        </S.Wrap>
      </Modal.Content>
      <Modal.Footer>
        <S.FooterWrap>
          <Button mode="secondary" onPress={handleOpenSettings}>
            {t('txActions.signRaw.wrongTime.button')}
          </Button>
        </S.FooterWrap>
      </Modal.Footer>
    </Modal>
  );
});

export const openTimeNotSyncedModal = async () => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: TimeNotSyncedModal,
    path: 'TimeNotSynced',
  });

  return true;
};
