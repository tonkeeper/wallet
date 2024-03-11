import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  RestoreWalletAction,
  SetGeneratedVaultAction,
  SetWalletAction,
  WalletState,
  SetAddressesAction,
  SendCoinsAction,
  CreateWalletAction,
  ConfirmSendCoinsAction,
  DeployWalletAction,
  ToggleBiometryAction,
  WalletGetUnlockedVaultAction,
  CleanWalletAction,
} from '$store/wallet/interface';

const initialState: WalletState = {
  generatedVault: null,
  wallet: null,
  address: {},
};

export const { actions, reducer } = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    generateVault() {},
    restoreWallet(_, __: RestoreWalletAction) {},
    setGeneratedVault(state, action: SetGeneratedVaultAction) {
      state.generatedVault = action.payload;
    },
    createWallet(_, __: CreateWalletAction) {},
    setWallet(state, action: SetWalletAction) {
      state.wallet = action.payload;
    },
    setAddress(state, action: SetAddressesAction) {
      state.address = {
        ...state.address,
        ...action.payload,
      };
    },
    confirmSendCoins(_, __: ConfirmSendCoinsAction) {},
    sendCoins(_, __: SendCoinsAction) {},
    cleanWallet(_, __: CleanWalletAction) {},
    clearGeneratedVault(state) {
      state.generatedVault = null;
    },
    deployWallet(_, __: DeployWalletAction) {},
    toggleBiometry(_, __: ToggleBiometryAction) {},
    walletGetUnlockedVault(_, __: WalletGetUnlockedVaultAction) {},
  },
});

export { reducer as walletReducer, actions as walletActions };

const walletSelector = (state: RootState) => state.wallet;

export const walletWalletSelector = createSelector(
  walletSelector,
  (walletState) => walletState.wallet,
);

export const walletGeneratedVaultSelector = createSelector(
  walletSelector,
  (walletState) => walletState.generatedVault,
);
