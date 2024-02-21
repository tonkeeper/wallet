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
import { tk } from '$wallet';
import { Alert } from 'react-native';
import { BlockingLoader, Toast } from '@tonkeeper/uikit';
import { useMigration } from '$hooks/useMigration';

export const MigrationPasscode: FC<{
  route: RouteProp<MigrationStackParamList, MigrationStackRouteNames.Passcode>;
}> = () => {
  const [value, setValue] = useState('');

  const { bottom: bottomInset } = useSafeAreaInsets();
  const pinRef = useRef<PinCodeRef>(null);

  const { getMnemonicWithPasscode, doMigration } = useMigration();

  const triggerError = useCallback(() => {
    pinRef.current?.triggerError();
    setValue('');
  }, []);

  const handleKeyboard = useCallback(
    (newValue: string) => {
      const pin = newValue.substr(0, 4);
      setValue(pin);
      if (pin.length === 4) {
        setTimeout(async () => {
          try {
            console.log('start migration');
            const mnemonic = await getMnemonicWithPasscode(pin);

            BlockingLoader.show();

            pinRef.current?.triggerSuccess();

            await doMigration(mnemonic, pin);

            setTimeout(() => {
              setValue('');
              pinRef.current?.clearState();
            }, 1000);
          } catch (error) {
            if (error instanceof TypeError) {
              Toast.fail(t('error_network'));
            }

            setValue('');
            pinRef.current?.clearState();
            triggerError();
          } finally {
            BlockingLoader.hide();
          }
        }, 300);
      }
    },
    [doMigration, getMnemonicWithPasscode, triggerError],
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
        hideBackButton={!tk.migrationData?.biometryEnabled}
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
