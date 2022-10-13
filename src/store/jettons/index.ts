import {createSelector, createSlice} from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  SetJettonsAction,
  SetLoadingAction,
  JettonsState,
  LoadJettonsAction,
  SetShowJettonsAction,
  SetJettonMetadataAction,
  SetIsEnabledAction,
  SwitchExcludedJettonAction,
  SetExcludedJettonsAction,
  LoadJettonMetaAction,
} from './interface';

const initialState: JettonsState = {
  isLoading: false,
  jettonBalances: [],
  jettons: {},
  showJettons: false,
  isEnabled: false,
  excludedJettons: {},
  isMetaLoading: {},
};

export const { actions, reducer } = createSlice({
  name: 'jettons',
  initialState,
  reducers: {
    loadJettons(state, action: LoadJettonsAction) {
      state.isLoading = true;
    },
    loadJettonMeta(state, action: LoadJettonMetaAction) {
      state.isMetaLoading[action.payload] = true;
    },
    getIsFeatureEnabled(state) {},
    setIsEnabled(state, action: SetIsEnabledAction) {
      state.isEnabled = action.payload;
    },
    setIsLoading(state, action: SetLoadingAction) {
      state.isLoading = action.payload;
    },
    switchExcludedJetton(state, action: SwitchExcludedJettonAction) {},
    setExcludedJettons(state, action: SetExcludedJettonsAction) {
      state.excludedJettons = action.payload;
    },
    setShowJettons(state, action: SetShowJettonsAction) {
      state.showJettons = action.payload;
    },
    setJettonBalances(state, action: SetJettonsAction) {
      state.jettonBalances = action.payload.jettonBalances;
    },
    setJettonMetadata(state, action: SetJettonMetadataAction) {
      state.jettons = {
        ...state.jettons,
        [action.payload.jetton.jettonAddress]: action.payload.jetton,
      };
      state.isMetaLoading[action.payload.jetton.jettonAddress] = false;
    },
    resetJettons() {
      return initialState;
    },
  },
});

export { reducer as jettonsReducer, actions as jettonsActions };

export const jettonsSelector = (state: RootState) => state.jettons;
export const jettonsMetaSelector = createSelector(
  jettonsSelector,
  (jettons) => jettons.jettons,
);
export const jettonsBalancesSelector = createSelector(
  jettonsSelector,
  (jettons) => jettons.jettonBalances,
);
export const jettonsIsMetaLoadingSelector = createSelector(
  jettonsSelector,
  (jettons) => jettons.isMetaLoading,
);

export const jettonIsLoadingSelector = createSelector(
  [
    jettonsIsMetaLoadingSelector,
    (jettonsMetaIsLoading, jettonAddress: string) => jettonAddress,
  ],
  (jettonsMetaIsLoading, jettonAddress) => jettonsMetaIsLoading[jettonAddress],
);
export const jettonSelector = createSelector(
  [jettonsMetaSelector, (jettons, jettonAddress: string) => jettonAddress],
  (jettons, jettonAddress) => jettons[jettonAddress],
);
