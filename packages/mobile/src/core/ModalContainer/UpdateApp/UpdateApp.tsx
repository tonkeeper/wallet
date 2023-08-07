import React, { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Button, Icon, Spacer, Text, View } from '$uikit';
import { bytesToMegabytes, delay } from '$utils';
import { Steezy } from '$styles';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';

export const UpdateAppModal = memo(() => {
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
    startUpdate();
  }, [nav, startUpdate]);

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
            <Text color="textTertiary"> · </Text>
            {t('update.mb', { size: bytesToMegabytes(meta?.size || 0) })}
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
            {t('update.remindLater')}
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

export const openUpdateAppModal = async () => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: UpdateAppModal,
    path: 'UpdateApp',
  });

  return true;
};
