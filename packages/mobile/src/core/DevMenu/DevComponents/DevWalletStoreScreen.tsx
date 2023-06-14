import React from 'react';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Screen } from '$uikit';
import { List, ListCell } from '$uikit/List/old/List';
import { WalletStore } from '$libs/WalletStore';
import TonWeb from 'tonweb';
import { Toast } from '$store/zustand';

export const DevWalletStoreScreen: React.FC = () => {
  //const words = ["defy", "leopard", "dutch", "exclude", "tortoise", "also", "hen", "resource", "large", "stereo", "remain", "brother", "original", "curve", "media", "valid", "summer", "impose", "expand", "rebel", "six", "loyal", "hungry", "shoe"];
  //const pubkey = '2671942773bc7da30afd4a7dd32fdd156f4472ac3cbecde2459175c3c77d4e8c';

  const words = [
    'siege',
    'wasp',
    'pencil',
    'awake',
    'rotate',
    'swear',
    'wedding',
    'oblige',
    'region',
    'thunder',
    'pilot',
    'child',
    'rice',
    'huge',
    'tongue',
    'jump',
    'deal',
    'cram',
    'conduct',
    'notice',
    'exchange',
    'excite',
    'fog',
    'isolate',
  ];
  const pubkey = 'a4a571929f1dfbe1f697d13764b96a1a168014c131d65d5c546371a5a00fd54c';
  const password = '';

  return (
    <Screen>
      <Screen.Header title="Wallet Store" rightContent={<AttachScreenButton />} />
      <Screen.ScrollView>
        <List align="left">
          <ListCell
            label="WalletStore.importWalletWithPasscode"
            onPress={async () => {
              try {
                const walletInfo = await WalletStore.importWalletWithPasscode(
                  words,
                  password,
                );

                console.log(walletInfo);
                Toast.show(JSON.stringify(walletInfo));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.importWalletWithBiometry"
            onPress={async () => {
              try {
                const walletInfo = await WalletStore.importWalletWithBiometry(words);

                console.log(walletInfo);
                Toast.show(JSON.stringify(walletInfo));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.validate"
            onPress={async () => {
              const isValid = await WalletStore.validate(words);

              const result = { isValid };

              console.log(result);
              Toast.show(JSON.stringify(result));
            }}
          />

          <ListCell
            label="WalletStore.listWallets"
            onPress={async () => {
              try {
                const result = await WalletStore.listWallets();
                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.getWallet"
            onPress={async () => {
              try {
                const result = await WalletStore.getWallet(pubkey);
                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.getWalletByAddress"
            onPress={async () => {
              try {
                const addr = new TonWeb.Address(
                  'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                ).toString(false);

                console.log(addr);
                const result = await WalletStore.getWalletByAddress(addr);
                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.exportKey"
            onPress={async () => {
              try {
                const result = await WalletStore.exportKey(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.exportWithPasscode"
            onPress={async () => {
              try {
                const result = await WalletStore.exportWithPasscode(pubkey, password);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.exportWithBiometry"
            onPress={async () => {
              try {
                const result = await WalletStore.exportWithBiometry(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.backup"
            onPress={async () => {
              try {
                const result = await WalletStore.backup(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.backupWithPasscode"
            onPress={async () => {
              try {
                const result = await WalletStore.backupWithPasscode(pubkey, password);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.backupWithBiometry"
            onPress={async () => {
              try {
                const result = await WalletStore.backupWithBiometry(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.currentWalletInfo"
            onPress={async () => {
              try {
                const result = await WalletStore.currentWalletInfo();

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.setCurrentWallet"
            onPress={async () => {
              try {
                const result = await WalletStore.setCurrentWallet(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.updateWallet"
            onPress={async () => {
              try {
                const result = await WalletStore.updateWallet(pubkey, 'label11111');

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.removeWallets"
            onPress={async () => {
              try {
                const result = await WalletStore.removeWallets();

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />

          <ListCell
            label="WalletStore.removeWallet"
            onPress={async () => {
              try {
                const result = await WalletStore.removeWallet(pubkey);

                console.log(result);
                Toast.show(JSON.stringify(result));
              } catch (err) {
                console.error(err);
                Toast.show(JSON.stringify(err.message));
              }
            }}
          />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
