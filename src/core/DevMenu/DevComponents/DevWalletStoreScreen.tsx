import React from 'react';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { List, ListCell, Screen } from '$uikit';
import { WalletStore } from '$libs/WalletStore';
import TonWeb from 'tonweb';
import { Toast } from '$store';

export const DevWalletStoreScreen: React.FC = () => {
  const words = [];
  const pubkey = '';

  return (
    <Screen>
      <Screen.Header title="Wallet Store" rightContent={<AttachScreenButton />} />
      <Screen.ScrollView>
        <List align="left">
          <ListCell 
            label="WalletStore.importWalletWithPasscode"
            onPress={async () => {
              try {
                const walletInfo = await WalletStore.importWalletWithPasscode(words, '1234');

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

                const addr = new TonWeb.Address('EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n').toString(false)
                
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
            label="WalletStore.exportWithPasscode" 
            onPress={async () => {
              try {  
                const result = await WalletStore.exportWithPasscode(pubkey, '1234');
                
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
            label="WalletStore.backupWithPasscode" 
            onPress={async () => {
              try {  
                const result = await WalletStore.backupWithPasscode(pubkey, '1234');
                
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
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
