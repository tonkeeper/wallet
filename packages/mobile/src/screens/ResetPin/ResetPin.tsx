import { FC, useCallback } from 'react';
import { NavBar } from '$uikit';
import { Steezy, Toast, View } from '@tonkeeper/uikit';
import { CreatePinForm } from '$shared/components';
import { t } from '@tonkeeper/shared/i18n';
import { useParams } from '@tonkeeper/router/src/imperative';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import { vault } from '$wallet';
import { useNavigation } from '@tonkeeper/router';

export const ResetPin: FC = () => {
  const { passcode: oldPasscode } = useParams<{ passcode: string }>();
  const { biometryEnabled, enableBiometry, disableBiometry } = useBiometrySettings();
  const nav = useNavigation();

  const handlePinCreated = useCallback(
    async (passcode: string) => {
      if (!oldPasscode) {
        return;
      }

      try {
        await vault.changePasscode(oldPasscode, passcode);

        if (biometryEnabled) {
          await disableBiometry();

          try {
            await enableBiometry(passcode);
          } catch {}
        }

        Toast.success(t('passcode_changed'));
        nav.goBack();
      } catch (e) {
        Toast.fail(e.message);
        nav.goBack();
      }
    },
    [biometryEnabled, disableBiometry, enableBiometry, nav, oldPasscode],
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
