import React, { memo, useCallback } from 'react';
import { t } from '$translation';
import { Modal, useNavigation } from '$libs/navigation';
import { push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { Button, Icon, Text, View } from '$uikit';
import { Linking, Platform } from 'react-native';
import { Base64, delay } from '$utils';
import { Steezy } from '$styles';

export const UpdateAppModal = memo(() => {
  const nav = useNavigation();

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
        <View style={styles.wrap}>
          <Icon style={{ marginBottom: 12 }} name={'ic-exclamationmark-circle-84'} />
          <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
            {t('txActions.signRaw.wrongTime.title')}
          </Text>
          <Text variant="body1" color="foregroundSecondary" textAlign="center">
            {t('txActions.signRaw.wrongTime.description')}
          </Text>
        </View>
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerWrap}>
          <Button mode="secondary" onPress={handleOpenSettings}>
            {t('txActions.signRaw.wrongTime.button')}
          </Button>
        </View>
      </Modal.Footer>
    </Modal>
  );
});

const styles = Steezy.create({
  wrap: {
    alignItems: 'center',
    padding: 32,
    textAlign: 'center',
    paddingTop: 48,
  },
  footerWrap: {
    paddingHorizontal: 16,
  },
});

export const openUpdateAppModal = async () => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: UpdateAppModal,
    path: 'UpdateApp',
  });

  return true;
};
