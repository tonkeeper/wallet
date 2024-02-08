import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as S from './ImportWallet.style';
import { NavBar } from '$uikit';
import { useKeyboardHeight } from '$hooks/useKeyboardHeight';
import { walletActions } from '$store/wallet';
import { AppStackRouteNames, TabsStackRouteNames, openCreatePin } from '$navigation';
import { ImportWalletForm } from '$shared/components';
import { tk } from '$wallet';
import { getLastEnteredPasscode } from '$store/wallet/sagas';
import { navigate, popToTop } from '$navigation/imperative';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '$navigation/MainStack';
import { MainStackRouteNames } from '$navigation';

export const ImportWallet: FC<{
  route: RouteProp<MainStackParamList, MainStackRouteNames.ImportWallet>;
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
            onEnd();
            if (tk.walletForUnlock) {
              try {
                await unlockVault();
                const pin = getLastEnteredPasscode();

                dispatch(
                  walletActions.createWallet({
                    pin,
                    isTestnet,
                    onDone: () => {
                      popToTop();
                      navigate(AppStackRouteNames.CustomizeWallet);
                    },
                    onFail: () => {},
                  }),
                );
              } catch {}
            } else {
              openCreatePin();
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
