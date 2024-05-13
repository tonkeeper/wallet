import { useNavigation } from '@tonkeeper/router';
import { Button, FastImage, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Linking } from 'react-native';
import { config } from '$config';
import { NotcoinBotIcon } from './NotcoinBotIcon';

export const NotcoinVerifyModal = memo(() => {
  const nav = useNavigation();

  const openNotcoinBot = useCallback(async () => {
    try {
      await Linking.openURL(config.get('notcoin_bot_url'));

      setTimeout(() => {
        nav.goBack();
      }, 1000);
    } catch {}
  }, [nav]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <NotcoinBotIcon style={styles.icon} />
          <Spacer y={20} />
          <Text type="h2" textAlign="center">
            {t('notcoin.verify_title')}
          </Text>
          <Spacer y={4} />
          <Text
            style={styles.desk.static}
            type="body1"
            color="textSecondary"
            textAlign="center"
          >
            {t('notcoin.verify_subtitle')}
          </Text>
          <Spacer y={48} />
          <Button title={t('notcoin.open_bot')} onPress={openNotcoinBot} />
          <Spacer y={16} />
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(() => ({
  container: {
    marginHorizontal: 16,
    marginTop: 48,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignSelf: 'center',
  },
  desk: {
    paddingHorizontal: 16,
  },
}));
