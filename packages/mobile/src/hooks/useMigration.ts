import { tk } from '$wallet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ScryptBox } from '$wallet/AppVault';
import { setLastEnteredPasscode } from '$store/wallet/sagas';
import { useNavigation } from '@tonkeeper/router';
import { MigrationStackRouteNames } from '$navigation/MigrationStack/types';
import { useImportWallet } from './useImportWallet';

export const useMigration = () => {
  const nav = useNavigation();

  const doImportWallet = useImportWallet();

  const getMnemonicWithBiometry = useCallback(async () => {
    const { keychainItemName } = tk.migrationData!;
    const isNewSecurityFlow = (await AsyncStorage.getItem('new_security_flow')) === 'yes';
    console.log('keychainItemName', keychainItemName);

    let jsonstr: any;
    if (isNewSecurityFlow) {
      console.log('allKeys', await AsyncStorage.getAllKeys);
      const keychainService = await AsyncStorage.getItem('keychainService');
      console.log('keychainService', keychainService);
      if (!keychainService) {
        throw new Error();
      }

      jsonstr = await SecureStore.getItemAsync('biometry_' + keychainItemName, {
        keychainService,
      });
    } else {
      jsonstr = await EncryptedStorage.getItem(keychainItemName);
    }
    console.log('jsonstr', jsonstr);

    if (jsonstr == null) {
      throw new Error();
    }
    const state = JSON.parse(jsonstr);
    if (state.kind !== 'decrypted') {
      throw new Error();
    }

    console.log('state.mnemonic', state.mnemonic);

    return state.mnemonic;
  }, []);

  const getMnemonicWithPasscode = useCallback(async (passcode: string) => {
    console.log('passcode', passcode);
    const { keychainItemName } = tk.migrationData!;
    const isNewSecurityFlow = (await AsyncStorage.getItem('new_security_flow')) === 'yes';

    let jsonstr: any;
    console.log('isNewSecurityFlow', isNewSecurityFlow);
    if (isNewSecurityFlow) {
      jsonstr = await SecureStore.getItemAsync(keychainItemName);
    } else {
      jsonstr = await EncryptedStorage.getItem(keychainItemName);
    }
    console.log(jsonstr);

    if (jsonstr == null) {
      throw new Error('Failed to unlock the vault');
    }

    const state = JSON.parse(jsonstr);
    if (state.kind === 'decrypted') {
      return state.mnemonic;
    } else {
      return ScryptBox.decrypt(passcode, state);
    }
  }, []);

  const doMigration = useCallback(
    async (mnemonic: string, passcode: string) => {
      const { lockupConfig } = tk.migrationData!;
      console.log('lockupConfig', JSON.stringify(lockupConfig));
      setLastEnteredPasscode(passcode);

      const walletsInfo = await tk.getWalletsInfo(mnemonic, false);
      console.log('walletsInfo', JSON.stringify(walletsInfo));

      const shouldChooseWallets = !lockupConfig && walletsInfo.length > 1;
      console.log('shouldChooseWallets', shouldChooseWallets);

      if (shouldChooseWallets) {
        nav.navigate(MigrationStackRouteNames.ChooseWallets, {
          walletsInfo,
          mnemonic,
          lockupConfig,
          isTestnet: false,
          isMigration: true,
        });
      } else {
        const versions = walletsInfo.map((item) => item.version);
        console.log('versions', versions);

        await doImportWallet(mnemonic, lockupConfig, versions, false, true);
      }
    },
    [doImportWallet, nav],
  );

  return { getMnemonicWithPasscode, doMigration, getMnemonicWithBiometry };
};
