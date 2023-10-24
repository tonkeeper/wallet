
import { useNavigation } from '@tonkeeper/router';
import { Button, Icon, List, Modal, Steezy, View } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { useNewWallet } from '../hooks/useWallet';


const useWallets = () => {
  return [
    {
      identity: '123',
      name: 'Wallet',
    },
    {
      identity: '333',
      name: 'Main',
    },
  ];
};

export const SwitchWalletModal = memo(() => {
  const nav = useNavigation();
  const currentWallet = useNewWallet();
  // const switchWallet = useSwitchWallet();
  const wallets = useWallets();

  const handleSwitchWallet = useCallback(
    (identity: string) => () => {
      // tk.switchWalle(identity);

      const wallet = wallets.find((i) => i.identity === identity);
      // switchWallet(wallet);
    },
    [],
  );

  return (
    <Modal>
      <Modal.Header title="Switch wallet" center />
      <Modal.Content safeArea>
        <List>
          {wallets.map((wallet) => (
            <List.Item
              onPress={handleSwitchWallet(wallet.identity)}
              key={wallet.identity}
              title={wallet.name}
              rightContent={
                currentWallet.identity === wallet.identity && (
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
            title="Add wallet"
            size="small"
          />
          {wallets.length > 1 && (
            <Button
              style={styles.editButton.static}
              navigate="/edit-wallets"
              size="small"
              color="secondary"
              title="Edit"
            />
          )}
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create({
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
});
