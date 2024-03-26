import { useNavigation } from '@tonkeeper/router';
import {
  BlockingLoader,
  Icon,
  List,
  Modal,
  Spacer,
  Steezy,
  Text,
  View,
} from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { t } from '../i18n';
import { DevFeature, useDevFeaturesToggle } from '@tonkeeper/mobile/src/store';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { getLastEnteredPasscode } from '@tonkeeper/mobile/src/store/wallet/sagas';
import { config } from '@tonkeeper/mobile/src/config';

interface AddWalletModalProps {
  isTonConnect?: boolean;
}

export const AddWalletModal = memo<AddWalletModalProps>(({ isTonConnect }) => {
  const nav = useNavigation();
  const unlockVault = useUnlockVault();

  const { devFeatures } = useDevFeaturesToggle();

  const handleCreatePress = useCallback(async () => {
    if (tk.walletForUnlock) {
      try {
        await unlockVault();

        nav.goBack();
        BlockingLoader.show();

        const passcode = getLastEnteredPasscode();
        const identifiers = await tk.createWallet(passcode);
        const isNotificationsDenied = await tk.wallet.notifications.getIsDenied();

        if (!isNotificationsDenied) {
          nav.navigate('CreateWalletStack', {
            screen: 'CreateWalletNotifications',
            params: { identifiers },
          });
          return;
        }

        if (tk.wallets.size > 1 && tk.wallets.size !== identifiers.length) {
          nav.navigate('CustomizeWallet', { identifiers });
        }
      } catch {
      } finally {
        BlockingLoader.hide();
      }
    } else {
      nav.goBack();
      nav.navigate('CreateWalletStack');
    }
  }, [nav]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.caption}>
          <Text type="h2" textAlign="center">
            {t('add_wallet_modal.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('add_wallet_modal.subtitle')}
          </Text>
        </View>
        <View style={styles.listContainer}>
          <List>
            <List.Item
              onPress={handleCreatePress}
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-plus-circle-28" color="accentBlue" />}
              title={t('add_wallet_modal.create.title')}
              subtitle={t('add_wallet_modal.create.subtitle')}
              subtitleNumberOfLines={3}
              chevron
            />
          </List>
          <List>
            <List.Item
              onPress={() => {
                nav.goBack();
                nav.navigate('ImportWalletStack');
              }}
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-key-28" color="accentBlue" />}
              title={t('add_wallet_modal.import.title')}
              subtitle={t('add_wallet_modal.import.subtitle')}
              subtitleNumberOfLines={3}
              chevron
            />
          </List>
          {!isTonConnect ? (
            <List>
              <List.Item
                onPress={() => {
                  nav.goBack();
                  nav.navigate('AddWatchOnlyStack');
                }}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-magnifying-glass-28" color="accentBlue" />}
                title={t('add_wallet_modal.watch_only.title')}
                subtitle={t('add_wallet_modal.watch_only.subtitle')}
                subtitleNumberOfLines={3}
                chevron
              />
            </List>
          ) : null}
          {config.get('devmode_enabled') ? (
            <List>
              <List.Item
                onPress={() => {
                  nav.goBack();
                  nav.navigate('ImportWalletStack', {
                    screen: 'ImportWallet',
                    params: { testnet: true },
                  });
                }}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-testnet-28" color="accentBlue" />}
                title={t('add_wallet_modal.testnet.title')}
                subtitle={t('add_wallet_modal.testnet.subtitle')}
                subtitleNumberOfLines={3}
                chevron
              />
            </List>
          ) : null}
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create({
  iconContainer: {
    alignSelf: 'center',
  },
  caption: {
    paddingTop: 48,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  listContainer: {
    marginHorizontal: 16,
    paddingBottom: 16,
  },
});
