import { AppStackRouteNames, MainStackRouteNames } from '../navigationNames';
import { CryptoCurrency } from '$shared/constants';
import * as LocalAuthentication from 'expo-local-authentication';

export type MainStackParamList = {
  [MainStackRouteNames.Tabs]: {};
  [MainStackRouteNames.Wallet]: {
    currency: CryptoCurrency;
  };
  [MainStackRouteNames.ImportWallet]: {};
  [MainStackRouteNames.Subscriptions]: {};
  [MainStackRouteNames.BackupWords]: {
    mnemonic: string;
  };
  [MainStackRouteNames.CreatePin]: {};
  [MainStackRouteNames.SetupBiometry]: {
    pin: string;
    biometryType: LocalAuthentication.AuthenticationType;
  };
  [MainStackRouteNames.ImportWalletDone]: {};
  [MainStackRouteNames.DevStack]: {};
  [MainStackRouteNames.SetupNotifications]: {};
  [MainStackRouteNames.Jetton]: {
    jettonAddress: string;
  };
  [MainStackRouteNames.JettonsList]: {};
  [MainStackRouteNames.DeleteAccountDone]: {};
  [MainStackRouteNames.EditConfig]: {};
};
