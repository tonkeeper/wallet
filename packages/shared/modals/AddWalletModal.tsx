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
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { getLastEnteredPasscode } from '@tonkeeper/mobile/src/store/wallet/sagas';
import { config } from '@tonkeeper/mobile/src/config';
import { InteractionManager } from 'react-native';
import { walletActions } from '@tonkeeper/mobile/src/store/wallet';
import { useDispatch } from 'react-redux';
import { getFlag } from '@tonkeeper/mobile/src/utils/flags';

interface AddWalletModalProps {
  isTonConnect?: boolean;
  isImport?: boolean;
}

export const AddWalletModal = memo<AddWalletModalProps>(({ isTonConnect, isImport }) => {
  const nav = useNavigation();
  const unlockVault = useUnlockVault();
  const dispatch = useDispatch();

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
      dispatch(walletActions.generateVault());
      nav.navigate('CreateWalletStack');
    }
  }, [nav, dispatch]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.caption}>
          <Text type="h2" textAlign="center">
            {isImport ? t('add_wallet_modal.import_title') : t('add_wallet_modal.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {isImport
              ? t('add_wallet_modal.import_subtitle')
              : t('add_wallet_modal.subtitle')}
          </Text>
        </View>
        <View style={styles.listContainer}>
          {!isImport ? (
            <List style={styles.list}>
              <List.Item
                onPress={handleCreatePress}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-plus-outline-28" color="accentBlue" />}
                title={t('add_wallet_modal.create.title')}
                subtitle={t('add_wallet_modal.create.subtitle')}
                subtitleNumberOfLines={3}
                chevron
              />
            </List>
          ) : null}
          <List style={styles.list}>
            <List.Item
              onPress={() => {
                nav.goBack();
                InteractionManager.runAfterInteractions(() => {
                  nav.navigate('ImportWalletStack');
                });
              }}
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-import-wallet-outline-28" color="accentBlue" />}
              title={t('add_wallet_modal.import.title')}
              subtitle={t('add_wallet_modal.import.subtitle')}
              subtitleNumberOfLines={3}
              chevron
            />
          </List>
          {!isTonConnect &&
          (!config.get('disable_signer') || !getFlag('disable_signer')) ? (
            <List style={styles.list}>
              <List.Item
                onPress={() => {
                  nav.goBack();
                  InteractionManager.runAfterInteractions(() => {
                    nav.navigate('ImportWalletStack', {
                      screen: 'PairSignerScreen',
                    });
                  });
                }}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-globe-outline-28" color="accentBlue" />}
                title={t('add_wallet_modal.signer.title')}
                subtitle={t('add_wallet_modal.signer.subtitle')}
                subtitleNumberOfLines={3}
                chevron
              />
            </List>
          ) : null}
          {!isTonConnect && !getFlag('disable_ledger') ? (
            <List style={styles.list}>
              <List.Item
                onPress={() => {
                  nav.replaceModal('/pair-ledger');
                }}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-ledger-28" color="accentBlue" />}
                title={t('add_wallet_modal.ledger.title')}
                subtitle={t('add_wallet_modal.ledger.subtitle')}
                subtitleNumberOfLines={3}
                chevron
              />
            </List>
          ) : null}
          {!isTonConnect || config.get('devmode_enabled') ? (
            <>
              <Spacer y={12} />
              <Text textAlign="center" color="textSecondary">
                {t('add_wallet_modal.other_options')}
              </Text>
              <Spacer y={20} />
              {!isTonConnect ? (
                <List style={styles.list}>
                  <List.Item
                    onPress={() => {
                      nav.goBack();
                      InteractionManager.runAfterInteractions(() => {
                        nav.navigate('AddWatchOnlyStack');
                      });
                    }}
                    leftContentStyle={styles.iconContainer}
                    leftContent={
                      <Icon name="ic-magnifying-glass-outline-28" color="accentBlue" />
                    }
                    title={t('add_wallet_modal.watch_only.title')}
                    subtitle={t('add_wallet_modal.watch_only.subtitle')}
                    subtitleNumberOfLines={3}
                    chevron
                  />
                </List>
              ) : null}
              {config.get('devmode_enabled') ? (
                <List style={styles.list}>
                  <List.Item
                    onPress={() => {
                      nav.goBack();
                      InteractionManager.runAfterInteractions(() => {
                        nav.navigate('ImportWalletStack', {
                          screen: 'ImportWallet',
                          params: { testnet: true },
                        });
                      });
                    }}
                    leftContentStyle={styles.iconContainer}
                    leftContent={<Icon name="ic-testnet-outline-28" color="accentBlue" />}
                    title={t('add_wallet_modal.testnet.title')}
                    subtitle={t('add_wallet_modal.testnet.subtitle')}
                    subtitleNumberOfLines={3}
                    chevron
                  />
                </List>
              ) : null}
            </>
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
  list: {
    marginBottom: 8,
  },
});
