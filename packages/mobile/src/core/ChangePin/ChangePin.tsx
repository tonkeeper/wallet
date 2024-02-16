import React, { FC, useCallback, useState } from 'react';

import { NavBar } from '$uikit';
import { CreatePinForm } from '$shared/components';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { goBack } from '$navigation/imperative';
import { vault } from '$wallet';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';

export const ChangePin: FC = () => {
  const [oldPin, setOldPin] = useState<string | null>(null);
  const { biometryEnabled, enableBiometry, disableBiometry } = useBiometrySettings();

  const handleCreated = useCallback(
    async (pin: string) => {
      if (!oldPin) {
        return;
      }

      try {
        await vault.changePasscode(oldPin, pin);

        if (biometryEnabled) {
          await disableBiometry();

          try {
            await enableBiometry(pin);
          } catch {}
        }

        Toast.success(t('passcode_changed'));
        goBack();
      } catch (e) {
        Toast.fail(e.message);
        goBack();
      }
    },
    [biometryEnabled, disableBiometry, enableBiometry, oldPin],
  );

  return (
    <>
      <NavBar isCancelButton />
      <CreatePinForm
        validateOldPin
        onPinCreated={handleCreated}
        onOldPinValidated={setOldPin}
      />
    </>
  );
};
