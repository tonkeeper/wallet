import React, { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Button, Icon, Spacer, Text, View } from '$uikit';
import { bytesToMegabytes, delay } from '$utils';
import { Steezy } from '$styles';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { Linking, Platform } from 'react-native';
import { APPLE_STORE_URL, GOOGLE_PLAY_URL } from '$shared/constants';

export interface UpdateAppModalProps {
  isApkInstall: boolean;
}

export const UpdateAppModal = memo<UpdateAppModalProps>((props) => {
  const nav = useNavigation();
  const meta = useUpdatesStore((state) => state.meta);
  const { declineUpdate, startUpdate } = useUpdatesStore((state) => state.actions);

  const handleRemindLater = useCallback(async () => {
    nav.goBack();
    await delay(400);
    declineUpdate();
  }, [nav, declineUpdate]);

  const handleUpdate = useCallback(async () => {
    nav.goBack();
    await delay(400);
    if (!props.isApkInstall) {
      return Linking.openURL(
        Platform.select({
          ios: APPLE_STORE_URL,
          android: GOOGLE_PLAY_URL,
          default: '',
        }),
      );
    }

    startUpdate();
  }, [nav, props.isApkInstall, startUpdate]);

  return (
    <Modal>
      <Modal.Header onClose={declineUpdate} />
      <Modal.Content>
        <View style={styles.wrap}>
          <Icon colorless style={{ marginBottom: 16 }} name={'ic-tonkeeper-update-128'} />
          <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
            {t('update.title')}
          </Text>
          <Spacer y={4} />
          <Text variant="body1" color="textSecondary" textAlign="center">
            {t('update.version', { version: meta?.version })}
            {props.isApkInstall && (
              <>
                <Text color="textTertiary"> · </Text>
                {t('update.mb', { size: bytesToMegabytes(meta?.size || 0) })}
              </>
            )}
          </Text>
          <Spacer y={4} />
          <Text variant="body1" color="textSecondary" textAlign="center">
            {t('update.description')}
          </Text>
        </View>
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerWrap}>
          <Button mode="primary" onPress={handleUpdate}>
            {t('update.download')}
          </Button>
          <Spacer y={16} />
          <Button mode="secondary" onPress={handleRemindLater}>
            {props.isApkInstall ? t('update.remindLater') : t('update.later')}
          </Button>
        </View>
        <Spacer y={16} />
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

export const openUpdateAppModal = async (isApkInstall: boolean) => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: UpdateAppModal,
    params: { isApkInstall },
    path: 'UpdateApp',
  });

  return true;
};
