import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as S from './ImportWallet.style';
import { NavBar } from '$uikit';
import { useKeyboardHeight } from '$hooks';
import { walletActions } from '$store/wallet';
import { openCreatePin } from '$navigation';
import { ImportWalletForm } from '$shared/components';

export const ImportWallet: FC = () => {
  const dispatch = useDispatch();
  const keyboardHeight = useKeyboardHeight();

  const handleWordsFilled = useCallback(
    (mnemonics: string, config: any, onEnd: () => void) => {
      dispatch(
        walletActions.restoreWallet({
          mnemonics,
          config,
          onDone: () => {
            onEnd();
            openCreatePin();
          },
          onFail: () => onEnd(),
        }),
      );
    },
    [dispatch],
  );

  return (
    <S.Wrap style={{ paddingBottom: keyboardHeight }}>
      <NavBar isTransparent />
      <ImportWalletForm onWordsFilled={handleWordsFilled} />
    </S.Wrap>
  );
};
