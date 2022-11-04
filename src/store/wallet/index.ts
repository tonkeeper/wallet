import { createSelector, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { RootState } from '$store/rootReducer';
import {
  RestoreWalletAction,
  SetBalancesAction,
  SetGeneratedVaultAction,
  SetWalletAction,
  WalletState,
  TransferCoinsAction,
  SetAddressesAction,
  SendCoinsAction,
  ChangeBalanceAndReloadAction,
  SetCurrenciesAction,
  CreateWalletAction,
  ReloadBalanceTwiceAction,
  ConfirmSendCoinsAction,
  MigrateAction,
  WaitMigrationAction,
  DeployWalletAction,
  SetOldWalletBalanceAction,
  OpenMigrationAction,
  ToggleBiometryAction,
  ChangePinAction,
  WalletGetUnlockedVaultAction,
  RefreshBalancesPageAction,
} from '$store/wallet/interface';
import { SwitchVersionAction } from '$store/main/interface';
import { SelectableVersions } from '$shared/constants';

const initialState: WalletState = {
  isLoaded: false,
  isRefreshing: false,
  generatedVault: null,
  wallet: null,
  version: SelectableVersions.V4R2,
  currencies: [],
  balances: {},
  address: {},
  oldWalletBalances: [],
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
    createWallet(state, __: CreateWalletAction) {
      state.isLoaded = false;
    },
    loadBalances() {},
    refreshBalancesPage(state, action: RefreshBalancesPageAction) {
      state.isRefreshing = true;
    },
    endRefreshBalancesPage(state) {
      state.isRefreshing = false;
    },
    setWallet(state, action: SetWalletAction) {
      state.wallet = action.payload;
    },
    setBalances(state, action: SetBalancesAction) {
      state.balances = {
        ...state.balances,
        ...action.payload,
      };
      state.isRefreshing = false;
    },
    endLoading(state) {
      state.isLoaded = true;
    },
    setAddress(state, action: SetAddressesAction) {
      state.address = {
        ...state.address,
        ...action.payload,
      };
    },
    switchVersion(state, action: SwitchVersionAction) {
      state.version = action.payload;
    },
    loadCurrentVersion(state, action: SwitchVersionAction) {
      state.version = action.payload;
    },
    resetVersion(state) {
      state.version = SelectableVersions.V4R2;
    },
    transferCoins(_, __: TransferCoinsAction) {},
    confirmSendCoins(_, __: ConfirmSendCoinsAction) {},
    sendCoins(_, __: SendCoinsAction) {},
    changeBalanceAndReload(state, action: ChangeBalanceAndReloadAction) {
      const { currency, amount } = action.payload;

      if (state.balances[currency]) {
        state.balances[currency] = new BigNumber(state.balances[currency])
          .plus(amount)
          .toString();
      }
    },
    setCurrencies(state, action: SetCurrenciesAction) {
      state.currencies = action.payload;
    },
    reloadBalance(_, __: ReloadBalanceTwiceAction) {},
    reloadBalanceTwice(_, __: ReloadBalanceTwiceAction) {},
    reset() {
      return initialState;
    },
    backupWallet() {},
    cleanWallet() {},
    clearGeneratedVault(state) {
      state.generatedVault = null;
    },
    openMigration(_, __: OpenMigrationAction) {},
    migrate(_, __: MigrateAction) {},
    waitMigration(_, __: WaitMigrationAction) {},
    deployWallet(_, __: DeployWalletAction) {},
    setOldWalletBalance(state, action: SetOldWalletBalanceAction) {
      state.oldWalletBalances = action.payload;
    },
    toggleBiometry(_, __: ToggleBiometryAction) {},
    changePin(_, __: ChangePinAction) {},
    securityMigrate() {},
    walletGetUnlockedVault(_, __: WalletGetUnlockedVaultAction) {},
  },
});

export { reducer as walletReducer, actions as walletActions };

export const walletSelector = (state: RootState) => state.wallet;
export const walletVersionSelector = createSelector(
  walletSelector,
  (walletState) => walletState.version,
);

export const walletWalletSelector = createSelector(
  walletSelector,
  (walletState) => walletState.wallet,
);

export const walletAddressSelector = createSelector(
  walletSelector,
  (walletState) => walletState.address,
);

export const walletBalancesSelector = createSelector(
  walletSelector,
  (walletState) => walletState.balances,
);

export const walletGeneratedVaultSelector = createSelector(
  walletSelector,
  (walletState) => walletState.generatedVault,
);

export const walletOldBalancesSelector = createSelector(
  walletSelector,
  (walletState) => walletState.oldWalletBalances,
);
