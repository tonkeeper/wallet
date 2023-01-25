import { PayloadAction } from '@reduxjs/toolkit';

import { JettonBalanceModel, JettonMetadata } from '$store/models';

export type ExcludedJettons = { [key: string]: boolean };

export interface JettonsState {
  isLoading: boolean;
  jettonBalances: JettonBalanceModel[];
  jettons: { [key: string]: JettonMetadata };
  excludedJettons: ExcludedJettons;
  showJettons: boolean;
  isEnabled: boolean;
  isMetaLoading: { [key: string]: boolean };
}

export type LoadJettonsAction = PayloadAction<undefined>;
export type LoadJettonMetaAction = PayloadAction<string>;
export type SetLoadingAction = PayloadAction<boolean>;
export type SetIsEnabledAction = PayloadAction<boolean>;
export type SwitchExcludedJettonAction = PayloadAction<{ jetton: string, value: boolean }>;
export type SetExcludedJettonsAction = PayloadAction<ExcludedJettons>;
export type SetShowJettonsAction = PayloadAction<boolean>;
export type SetJettonsAction = PayloadAction<{
  jettonBalances: JettonBalanceModel[];
}>;
export type SetJettonMetadataAction = PayloadAction<{
  jetton: JettonMetadata;
}>;