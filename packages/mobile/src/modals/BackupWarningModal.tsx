import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { useNavigation } from '@tonkeeper/router';
import { Button, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { MainStackRouteNames } from '$navigation';
import { t } from '@tonkeeper/shared/i18n';
import { delay } from '$utils';

interface BackupWarningModalProps {
  isBackupAgain?: boolean;
}

export const BackupWarningModal = memo<BackupWarningModalProps>((props) => {
  const { isBackupAgain } = props;

  const nav = useNavigation();
  const unlock = useUnlockVault();

  const handleContinue = useCallback(async () => {
    try {
      const unlocked = await unlock();

      nav.goBack();
      await delay(600);

      nav.navigate(MainStackRouteNames.BackupPhrase, {
        mnemonic: unlocked.mnemonic,
        isBackupAgain,
      });
    } catch {}
  }, [isBackupAgain, nav, unlock]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <Text type="h2" textAlign="center">
            {t('backup_warning.title')}
          </Text>
          <Spacer y={4} />
          <Text
            style={styles.desk.static}
            type="body1"
            color="textSecondary"
            textAlign="center"
          >
            {t('backup_warning.caption')}
          </Text>
          <View style={styles.content}>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                {t('backup_warning.p1')}
              </Text>
            </View>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                {t('backup_warning.p2')}
              </Text>
            </View>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                {t('backup_warning.p3')}
              </Text>
            </View>
          </View>
          <Button title={t('backup_warning.continue_button')} onPress={handleContinue} />
          <Spacer y={16} />
          <Button
            title={t('backup_warning.cancel_button')}
            color="secondary"
            onPress={nav.goBack}
          />
          <Spacer y={16} />
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    marginHorizontal: 16,
    marginTop: 48,
  },
  content: {
    marginTop: 32,
    marginVertical: 32,
    backgroundColor: colors.backgroundContent,
    borderRadius: 16,
    paddingVertical: 12,
  },
  paragraph: {
    marginLeft: 21,
    marginVertical: 8,
    flexDirection: 'row',
  },
  desk: {
    paddingHorizontal: 16,
  },
  dot: {
    backgroundColor: colors.textPrimary,
    width: 2.8,
    height: 2.8,
    borderRadius: 2.8 / 2,
    marginTop: 9.8,
    marginRight: 9.5,
  },
  text: {
    paddingRight: 28,
  },
}));
