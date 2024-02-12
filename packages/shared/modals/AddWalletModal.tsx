import { useNavigation } from '@tonkeeper/router';
import { Icon, List, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo } from 'react';
import { t } from '../i18n';
import { DevFeature, useDevFeaturesToggle } from '@tonkeeper/mobile/src/store';

interface AddWalletModalProps {}

export const AddWalletModal = memo<AddWalletModalProps>((props) => {
  const nav = useNavigation();

  const { devFeatures } = useDevFeaturesToggle();

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
              onPress={() => {
                nav.goBack();
                nav.navigate('CreateWalletStack');
              }}
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-plus-circle-28" color="accentBlue" />}
              title={t('add_wallet_modal.create.title')}
              subtitle={t('add_wallet_modal.create.subtitle')}
              subtitleNumberOfLines={2}
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
              subtitleNumberOfLines={2}
              chevron
            />
          </List>
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
              subtitleNumberOfLines={2}
              chevron
            />
          </List>
          {devFeatures[DevFeature.ShowTestnet] ? (
            <List>
              <List.Item
                onPress={() => {
                  nav.goBack();
                  setTimeout(() => {
                    nav.navigate('ImportWalletStack', {
                      screen: 'ImportWallet',
                      params: { testnet: true },
                    });
                  }, 700);
                }}
                leftContentStyle={styles.iconContainer}
                leftContent={<Icon name="ic-testnet-28" color="accentBlue" />}
                title={t('add_wallet_modal.testnet.title')}
                subtitle={t('add_wallet_modal.testnet.subtitle')}
                subtitleNumberOfLines={2}
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
