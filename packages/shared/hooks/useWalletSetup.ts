import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import { Wallet, WalletSetupState } from '@tonkeeper/mobile/src/wallet/Wallet';

export function useWalletSetup<T = WalletSetupState>(
  selector?: ExternalStateSelector<WalletSetupState, T>,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(Wallet.INITIAL_SETUP_STATE)).current;

  return useExternalState(wallet?.setup ?? initialState, selector);
}
