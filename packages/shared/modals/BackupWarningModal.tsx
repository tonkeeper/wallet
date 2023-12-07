import { delay } from '@tonkeeper/core';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { useNavigation } from '@tonkeeper/router';
import { useParams } from '@tonkeeper/router/src/imperative';
import { Button, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';

interface BackupWarningModalProps {
  isBackupAgain?: boolean;
}

export const BackupWarningModal = memo<BackupWarningModalProps>((props) => {
  const nav = useNavigation();
  const unlock = useUnlockVault();

  const handleContinue = useCallback(async () => {
    const unlocked = await unlock();

    nav.goBack();
    await delay(600);

    nav.navigate('/backup-phrase', {
      isBackupAgain: props.isBackupAgain,
      phrase: unlocked.mnemonic,
    });
  }, []);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <Text type="h2" textAlign="center">
            Attention
          </Text>
          <Spacer y={4} />
          <Text
            style={styles.desk.static}
            type="body1"
            color="textSecondary"
            textAlign="center"
          >
            Please read the following carefully before viewing your recovery phrase.
          </Text>
          <View style={styles.content}>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                Never enter your recovery phrase any other place than Tonkeeper to access
                your wallet.
              </Text>
            </View>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                Tonkeeper Support never asks for a recovery phrase.
              </Text>
            </View>
            <View style={styles.paragraph}>
              <View style={styles.dot} />
              <Text type="body2" style={styles.text.static}>
                Everybody with your recovery phrase can access your wallet.
              </Text>
            </View>
          </View>
          <Button title="Continue" onPress={handleContinue} />
          <Spacer y={16} />
          <Button title="Cancel" color="secondary" onPress={() => nav.goBack()} />
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
    marginTop: 38,
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
  }
}));
