import { FC, useCallback, useRef, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import {
  MigrationStackParamList,
  MigrationStackRouteNames,
} from '$navigation/MigrationStack/types';
import * as S from '../../core/AccessConfirmation/AccessConfirmation.style';
import { Button, InlineKeyboard, NavBar, PinCode, Text } from '$uikit';
import { ns } from '$utils';
import { t } from '@tonkeeper/shared/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinCodeRef } from '$uikit/PinCode/PinCode.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@tonkeeper/router';
import { tk } from '$wallet';
import { useImportWallet } from '$hooks/useImportWallet';
import * as SecureStore from 'expo-secure-store';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ScryptBox } from '$wallet/AppVault';
import { Alert } from 'react-native';
import { Toast } from '@tonkeeper/uikit';

export const MigrationPasscode: FC<{
  route: RouteProp<MigrationStackParamList, MigrationStackRouteNames.Passcode>;
}> = () => {
  const [value, setValue] = useState('');

  const { bottom: bottomInset } = useSafeAreaInsets();
  const pinRef = useRef<PinCodeRef>(null);
  const nav = useNavigation();

  const doImportWallet = useImportWallet();

  const triggerError = useCallback(() => {
    pinRef.current?.triggerError();
    setValue('');
  }, []);

  const getMnemonic = useCallback(async (passcode: string) => {
    const { keychainItemName } = tk.migrationData!;
    const isNewSecurityFlow = (await AsyncStorage.getItem('new_security_flow')) === 'yes';

    let jsonstr: any;
    if (isNewSecurityFlow) {
      jsonstr = await SecureStore.getItemAsync(keychainItemName);
    } else {
      jsonstr = await EncryptedStorage.getItem(keychainItemName);
    }

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

  const handleKeyboard = useCallback(
    (newValue: string) => {
      const pin = newValue.substr(0, 4);
      setValue(pin);
      if (pin.length === 4) {
        setTimeout(async () => {
          try {
            console.log('start migration');
            Toast.loading();
            const mnemonic = await getMnemonic(pin);

            pinRef.current?.triggerSuccess();

            const { lockupConfig } = tk.migrationData!;

            const walletsInfo = await tk.getWalletsInfo(mnemonic, false);

            const shouldChooseWallets = !lockupConfig && walletsInfo.length > 1;

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

              await doImportWallet(mnemonic, lockupConfig, versions, false, true);
            }

            setTimeout(() => {
              pinRef.current?.clearState();
            }, 1000);
          } catch {
            triggerError();
          } finally {
            Toast.hide();
          }
        }, 300);
      }
    },
    [doImportWallet, getMnemonic, nav, triggerError],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(t('settings_reset_alert_title'), t('settings_reset_alert_caption'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_reset_alert_button'),
        style: 'destructive',
        onPress: () => {
          tk.setMigrated();
        },
      },
    ]);
  }, []);

  return (
    <S.Wrap>
      <NavBar
        hideBackButton
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={handleLogout}
          >
            {t('access_confirmation_logout')}
          </Button>
        }
      />
      <S.Content style={{ paddingBottom: bottomInset }}>
        <S.PinWrap>
          <Text variant="h3">{t('access_confirmation_title')}</Text>
          <S.Pin>
            <PinCode value={value} ref={pinRef} />
          </S.Pin>
        </S.PinWrap>
        <InlineKeyboard
          disabled={value.length === 4}
          onChange={handleKeyboard}
          value={value}
        />
      </S.Content>
    </S.Wrap>
  );
};
