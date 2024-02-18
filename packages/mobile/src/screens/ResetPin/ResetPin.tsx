import { FC, useCallback } from 'react';
import { NavBar } from '$uikit';
import { Steezy, Toast, View } from '@tonkeeper/uikit';
import { CreatePinForm } from '$shared/components';
import { t } from '@tonkeeper/shared/i18n';
import { useParams } from '@tonkeeper/router/src/imperative';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import { vault } from '$wallet';
import { useNavigation } from '@tonkeeper/router';
import * as LocalAuthentication from 'expo-local-authentication';
import { detectBiometryType } from '$utils';
import { MainStackRouteNames } from '$navigation';

export const ResetPin: FC = () => {
  const { passcode: oldPasscode } = useParams<{ passcode: string }>();
  const { biometryEnabled, disableBiometry } = useBiometrySettings();
  const nav = useNavigation();

  const handlePinCreated = useCallback(
    async (passcode: string) => {
      if (!oldPasscode) {
        return;
      }

      try {
        await vault.changePasscode(oldPasscode, passcode);

        Toast.success(t('passcode_changed'));

        if (biometryEnabled) {
          await disableBiometry();
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const biometryType = detectBiometryType(types);

          nav.replace(MainStackRouteNames.ChangePinBiometry, { biometryType, passcode });
        } else {
          nav.goBack();
        }
      } catch (e) {
        Toast.fail(e.message);
        nav.goBack();
      }
    },
    [biometryEnabled, disableBiometry, nav, oldPasscode],
  );

  return (
    <View style={styles.container}>
      <NavBar />
      <CreatePinForm onPinCreated={handlePinCreated} />
    </View>
  );
};

const styles = Steezy.create({
  container: {
    flex: 1,
  },
});
