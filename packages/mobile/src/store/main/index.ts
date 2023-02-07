import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import { FiatCurrencies } from '$shared/constants';
import {
  AddLogAction,
  EndInitiatingAction,
  HideNotificationAction,
  MainState,
  SetAccentAction,
  SetFiatCurrencyAction,
  SetHasWalletAction,
  SetLogsAction,
  SetNotificationsAction,
  SetShowV4R1,
  SetTestnetAction,
  SetTimeSyncedAction,
  SetTimeSyncedDismissedAction,
  SetTonCustomIcon,
  SetUnlockedAction,
  ToggleIntroAction,
  ToggleTestnetAction,
  UpdateBadHostsAction,
} from '$store/main/interface';
import { AccentKey } from '$styled';
import { walletOldBalancesSelector, walletWalletSelector } from '$store/wallet';
import { myNftsSelector, nftsSelector } from '$store/nfts';

const initialState: MainState = {
  isInitiating: true,
  isHasWallet: false,
  isIntroShown: true,
  isTestnet: false,
  isTimeSynced: true,
  timeSyncedDismissedTimestamp: false,
  fiatCurrency: FiatCurrencies.Usd,
  badHosts: [],
  isBadHostsDismissed: false,
  internalNotifications: [],
  isMainStackInited: false,
  logs: [],
  isUnlocked: false,
  accent: AccentKey.default,
  tonCustomIcon: null,
  alwaysShowV4R1: false,
};

export const { actions, reducer } = createSlice({
  name: 'main',
  initialState,
  reducers: {
    init() {},

    endInitiating(state, action: EndInitiatingAction) {
      const { isHasWallet, fiatCurrency } = action.payload;

      state.isInitiating = false;
      state.isHasWallet = isHasWallet;
      state.fiatCurrency = fiatCurrency;
    },

    setShowV4R1(state, action: SetShowV4R1) {
      state.alwaysShowV4R1 = action.payload;
    },

    setHasWallet(state, action: SetHasWalletAction) {
      state.isHasWallet = action.payload;
    },

    setUnlocked(state, action: SetUnlockedAction) {
      state.isUnlocked = action.payload;
    },

    completeIntro(state) {
      state.isIntroShown = false;
    },

    toggleIntro(state, action: ToggleIntroAction) {
      state.isIntroShown = action.payload;
    },

    toggleTestnet(_, __: ToggleTestnetAction) {},
    setTestnet(state, action: SetTestnetAction) {
      state.isTestnet = action.payload;
    },
    getTimeSynced() {},
    setTimeSynced(state, action: SetTimeSyncedAction) {
      state.isTimeSynced = action.payload;
    },
    setFiatCurrency(state, action: SetFiatCurrencyAction) {
      state.fiatCurrency = action.payload;
    },

    updateBadHosts(state, action: UpdateBadHostsAction) {
      if (JSON.stringify(state.badHosts) !== JSON.stringify(action.payload)) {
        state.isBadHostsDismissed = false;
      }
      state.badHosts = action.payload;
    },

    dismissBadHosts(state) {
      state.isBadHostsDismissed = true;
    },

    setTimeSyncedDismissed(state, action: SetTimeSyncedDismissedAction) {
      state.timeSyncedDismissedTimestamp = action.payload;
    },

    loadNotifications() {},

    setNotifications(state, action: SetNotificationsAction) {
      state.internalNotifications = action.payload;
    },

    hideNotification(state, action: HideNotificationAction) {
      const copied = [...state.internalNotifications];
      for (let i = 0; i < copied.length; i++) {
        if (copied[i].id === action.payload.id) {
          copied.splice(i, 1);
          state.internalNotifications = copied;
          break;
        }
      }
    },

    setAccent(state, action: SetAccentAction) {
      state.accent = action.payload;
    },

    setTonCustomIcon(state, action: SetTonCustomIcon) {
      state.tonCustomIcon = action.payload;
    },

    mainStackInited(state) {
      state.isMainStackInited = true;
    },

    resetMain() {
      return initialState;
    },

    addLog(state, action: AddLogAction) {
      state.logs.unshift({
        ts: Date.now(),
        trace: action.payload.trace,
        payload: action.payload.log,
        screen: action.payload.screen,
      });
      state.logs = state.logs.slice(0, 1000);
    },

    setLogs(state, action: SetLogsAction) {
      state.logs = action.payload;
    },
  },
});

export { reducer as mainReducer, actions as mainActions };

export const mainSelector = (state: RootState) => state.main;

export const isInitiatingSelector = createSelector(
  mainSelector,
  (state) => state.isInitiating,
);

export const fiatCurrencySelector = createSelector(
  mainSelector,
  (state) => state.fiatCurrency,
);

export const customIconSelector = createSelector(
  mainSelector,
  (state) => state.tonCustomIcon,
);

export const _accentSelector = createSelector(mainSelector, (state) => state.accent);

export const accentSelector = createSelector(
  walletWalletSelector,
  _accentSelector,
  (wallet, accent) => (wallet ? accent : AccentKey.default),
);

export const accentTonIconSelector = createSelector(
  walletWalletSelector,
  customIconSelector,
  (wallet, tonCustomIcon) => (wallet ? tonCustomIcon : null),
);

export const alwaysShowV4R1Selector = createSelector(
  mainSelector,
  (state) => state.alwaysShowV4R1,
);

export const isTestnetSelector = createSelector(mainSelector, (state) => state.isTestnet);

export const showV4R1Selector = createSelector(
  mainSelector,
  walletOldBalancesSelector,
  (state, walletOldBalances) =>
    state.alwaysShowV4R1 ||
    walletOldBalances.find(
      (oldBalance) => oldBalance.version === 'v4R1' && oldBalance.balance,
    ),
);

export const isTimeSyncedSelector = createSelector(
  mainSelector,
  (state) => state.isTimeSynced,
);
