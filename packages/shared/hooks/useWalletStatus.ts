import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import { Wallet, WalletStatusState } from '@tonkeeper/mobile/src/wallet/Wallet';

export function useWalletStatus<T = WalletStatusState>(
  selector?: ExternalStateSelector<WalletStatusState, T>,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(Wallet.INITIAL_STATUS_STATE)).current;

  return useExternalState(wallet?.status ?? initialState, selector);
}
