import { useNavigation } from '@tonkeeper/router';
import { Button, Icon, List, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo } from 'react';
import { useWallet, useWalletCurrency, useWallets } from '../hooks';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { t } from '../i18n';
import { formatter } from '../formatter';
import { Tag } from '@tonkeeper/mobile/src/uikit';
import { WalletListItem } from '../components';

export const SwitchWalletModal = memo(() => {
  const nav = useNavigation();
  const currentWallet = useWallet();
  const wallets = useWallets();
  const currency = useWalletCurrency();

  return (
    <Modal>
      <Modal.Header title={t('wallets')} />
      <Modal.ScrollView>
        <Modal.Content safeArea>
          <List>
            {wallets.map((wallet) => (
              <WalletListItem
                key={wallet.pubkey}
                wallet={wallet}
                onPress={() => {
                  tk.switchWallet(wallet.pubkey);
                  nav.goBack();
                }}
                subtitle={formatter.format(wallet.totalFiat, { currency })}
                rightContent={
                  currentWallet.pubkey === wallet.pubkey && (
                    <View style={styles.checkmark}>
                      <Icon
                        style={styles.checkmarkIcon.static}
                        name="ic-donemark-thin-28"
                        color="accentBlue"
                      />
                    </View>
                  )
                }
              />
            ))}
          </List>
          <View style={styles.buttons}>
            <Button
              // navigate="/add-wallet"
              onPress={() => {
                nav.goBack();
                setTimeout(() => {
                  nav.navigate('/add-wallet');
                }, 500);
              }}
              color="secondary"
              title={t('add_wallet')}
              size="small"
            />
            {/* {wallets.length > 1 && (
            <Button
              style={styles.editButton.static}
              navigate="/edit-wallets"
              size="small"
              color="secondary"
              title="Edit"
            />
          )} */}
          </View>
        </Modal.Content>
      </Modal.ScrollView>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    marginLeft: 12,
  },
  checkmark: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  checkmarkIcon: {
    position: 'absolute',
    right: 0,
    bottom: -2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: colors.backgroundHighlighted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
