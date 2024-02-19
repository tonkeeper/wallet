import React, { FC, useCallback, useState } from 'react';

import { NavBar } from '$uikit';
import { CreatePinForm } from '$shared/components';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { goBack } from '$navigation/imperative';
import { vault } from '$wallet';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import * as LocalAuthentication from 'expo-local-authentication';
import { detectBiometryType } from '$utils';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';

export const ChangePin: FC = () => {
  const [oldPasscode, setOldPasscode] = useState<string | null>(null);
  const { biometryEnabled, disableBiometry } = useBiometrySettings();
  const nav = useNavigation();

  const handleCreated = useCallback(
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
        goBack();
      }
    },
    [biometryEnabled, disableBiometry, nav, oldPasscode],
  );

  return (
    <>
      <NavBar isCancelButton />
      <CreatePinForm
        validateOldPin
        onPinCreated={handleCreated}
        onOldPinValidated={setOldPasscode}
      />
    </>
  );
};
