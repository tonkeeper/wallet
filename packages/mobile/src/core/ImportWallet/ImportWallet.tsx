import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as S from './ImportWallet.style';
import { NavBar } from '$uikit';
import { useKeyboardHeight } from '$hooks/useKeyboardHeight';
import { walletActions } from '$store/wallet';
import { openCreatePin, openSetupWalletDone } from '$navigation';
import { ImportWalletForm } from '$shared/components';
import { tk } from '$wallet';
import { getLastEnteredPasscode } from '$store/wallet/sagas';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { RouteProp } from '@react-navigation/native';
import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';

export const ImportWallet: FC<{
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.ImportWallet>;
}> = (props) => {
  const dispatch = useDispatch();
  const keyboardHeight = useKeyboardHeight();
  const unlockVault = useUnlockVault();

  const isTestnet = !!props.route.params?.testnet;

  const handleWordsFilled = useCallback(
    (mnemonics: string, config: any, onEnd: () => void) => {
      dispatch(
        walletActions.restoreWallet({
          mnemonics,
          config,
          onDone: async () => {
            if (tk.walletForUnlock) {
              try {
                await unlockVault();
                const pin = getLastEnteredPasscode();

                dispatch(
                  walletActions.createWallet({
                    pin,
                    isTestnet,
                    onDone: () => {
                      openSetupWalletDone();
                      onEnd();
                    },
                    onFail: () => {},
                  }),
                );
              } catch {}
            } else {
              openCreatePin();
              onEnd();
            }
          },
          onFail: () => onEnd(),
        }),
      );
    },
    [dispatch, isTestnet, unlockVault],
  );

  return (
    <S.Wrap style={{ paddingBottom: keyboardHeight }}>
      <NavBar isTransparent />
      <ImportWalletForm onWordsFilled={handleWordsFilled} />
    </S.Wrap>
  );
};
