import { PayloadAction } from '@reduxjs/toolkit';
import { FiatCurrency, SelectableVersion } from '$shared/constants';
import { InternalNotificationModel } from '$store/models';
import { AccentKey, AccentNFTIcon } from '$styled';

export interface LogItem {
  ts: number;
  trace: any;
  payload: any;
  screen: string;
}

export interface MainState {
  isInitiating: boolean;
  isIntroShown: boolean;
  isTimeSynced: boolean;
  timeSyncedDismissedTimestamp: false | number;
  fiatCurrency: FiatCurrency;
  badHosts: string[];
  isBadHostsDismissed: boolean;
  internalNotifications: InternalNotificationModel[];
  isMainStackInited: boolean;
  logs: LogItem[];
  isUnlocked: boolean;
  accent: AccentKey;
  tonCustomIcon: AccentNFTIcon | null;
  alwaysShowV4R1: boolean;
}

export type EndInitiatingAction = PayloadAction<{
  fiatCurrency: FiatCurrency;
}>;
export type ToggleIntroAction = PayloadAction<boolean>;
export type SetTestnetAction = PayloadAction<boolean>;
export type SetTimeSyncedAction = PayloadAction<boolean>;
export type SetTimeSyncedDismissedAction = PayloadAction<false | number>;
export type ToggleTestnetAction = PayloadAction<{ isTestnet: boolean }>;
export type SwitchVersionAction = PayloadAction<SelectableVersion>;
export type UpdateBadHostsAction = PayloadAction<string[]>;
export type SetNotificationsAction = PayloadAction<InternalNotificationModel[]>;
export type HideNotificationAction = PayloadAction<InternalNotificationModel>;
export type SetAccentAction = PayloadAction<AccentKey>;
export type SetTonCustomIcon = PayloadAction<AccentNFTIcon | null>;
export type AddLogAction = PayloadAction<{
  log: any;
  trace: any;
  screen: string;
}>;
export type SetLogsAction = PayloadAction<LogItem[]>;
export type SetUnlockedAction = PayloadAction<boolean>;
export type SetShowV4R1 = PayloadAction<boolean>;
