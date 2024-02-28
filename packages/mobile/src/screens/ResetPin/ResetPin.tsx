import { FC, useCallback } from 'react';
import { NavBar } from '$uikit';
import { Steezy, Toast, View } from '@tonkeeper/uikit';
import { CreatePinForm } from '$shared/components';
import { t } from '@tonkeeper/shared/i18n';
import { useParams } from '@tonkeeper/router/src/imperative';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import { vault } from '$wallet';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';

export const ResetPin: FC = () => {
  const { passcode: oldPasscode } = useParams<{ passcode: string }>();
  const biometry = useBiometrySettings();
  const nav = useNavigation();

  const handlePinCreated = useCallback(
    async (passcode: string) => {
      if (!oldPasscode) {
        return;
      }

      try {
        await vault.changePasscode(oldPasscode, passcode);

        Toast.success(t('passcode_changed'));

        if (biometry.isEnabled) {
          await biometry.disableBiometry();

          nav.replace(MainStackRouteNames.ChangePinBiometry, { passcode });
        } else {
          nav.goBack();
        }
      } catch (e) {
        Toast.fail(e.message);
        nav.goBack();
      }
    },
    [biometry, nav, oldPasscode],
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
