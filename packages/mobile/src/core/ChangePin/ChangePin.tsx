import React, { FC, useCallback, useState } from 'react';

import { NavBar } from '$uikit';
import { CreatePinForm } from '$shared/components';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { goBack } from '$navigation/imperative';
import { vault } from '$wallet';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';

export const ChangePin: FC = () => {
  const [oldPasscode, setOldPasscode] = useState<string | null>(null);
  const biometry = useBiometrySettings();
  const nav = useNavigation();

  const handleCreated = useCallback(
    async (passcode: string) => {
      if (!oldPasscode) {
        return;
      }

      try {
        await vault.changePasscode(oldPasscode, passcode);

        Toast.success(t('passcode_changed'));

        if (biometry.isEnabled) {
          await biometry.disableBiometry();

          if (biometry.isAvailable) {
            nav.replace(MainStackRouteNames.ChangePinBiometry, { passcode });
          } else {
            nav.goBack();
          }
        } else {
          nav.goBack();
        }
      } catch (e) {
        Toast.fail(e.message);
        goBack();
      }
    },
    [biometry, nav, oldPasscode],
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
