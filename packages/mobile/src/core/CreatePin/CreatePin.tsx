import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as S from '../AccessConfirmation/AccessConfirmation.style';
import { NavBar } from '$uikit';
import { openSetupNotifications, openSetupWalletDone } from '$navigation';
import { walletActions } from '$store/wallet';
import { CreatePinForm } from '$shared/components';
import { tk } from '$wallet';
import { popToTop } from '$navigation/imperative';
import { useParams } from '@tonkeeper/router/src/imperative';
import { BlockingLoader, Screen } from '@tonkeeper/uikit';

export const CreatePin: FC = () => {
  const params = useParams<{ isImport?: boolean }>();
  const dispatch = useDispatch();

  const isImport = !!params.isImport;

  const handlePinCreated = useCallback(
    async (pin: string) => {
      BlockingLoader.show();
      dispatch(
        walletActions.createWallet({
          pin,
          onDone: (identifiers) => {
            if (isImport) {
              tk.saveLastBackupTimestampAll(identifiers);
            }
            if (tk.wallet.notifications.isAvailable) {
              openSetupNotifications(identifiers);
            } else {
              openSetupWalletDone(identifiers);
            }
            BlockingLoader.hide();
          },
          onFail: () => {
            BlockingLoader.hide();
          },
        }),
      );
    },
    [dispatch, isImport],
  );

  return (
    <Screen alternateBackground>
      <S.Wrap>
        <NavBar onClosePress={popToTop} />
        <CreatePinForm onPinCreated={handlePinCreated} />
      </S.Wrap>
    </Screen>
  );
};
