import React, { FC, useCallback, useState } from 'react';

import { NavBar } from '$uikit';
import { CreatePinForm } from '$shared/components';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { goBack } from '$navigation/imperative';
import { vault } from '$wallet';

export const ChangePin: FC = () => {
  const [oldPin, setOldPin] = useState<string | null>(null);

  const handleCreated = useCallback(
    async (pin: string) => {
      if (!oldPin) {
        return;
      }

      try {
        await vault.changePasscode(oldPin, pin);
        Toast.success(t('passcode_changed'));
        goBack();
      } catch (e) {
        Toast.fail(e.message);
        goBack();
      }
    },
    [oldPin],
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
