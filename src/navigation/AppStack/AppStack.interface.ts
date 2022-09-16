import { AppStackRouteNames } from '$navigation';
import { CryptoCurrency } from '$shared/constants';
import { SubscriptionModel } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';

export type AppStackParamList = {
  [AppStackRouteNames.Intro]: {};
  [AppStackRouteNames.MainStack]: {};
  [AppStackRouteNames.Receive]: {
    currency: CryptoCurrency;
    isJetton?: boolean;
    jettonAddress?: string;
    isFromMainScreen?: boolean;
  };
  [AppStackRouteNames.Send]: {
    currency?: CryptoCurrency | string;
    address?: string;
    comment?: string;
    isJetton?: boolean;
    amount?: string;
    fee?: string;
    isInactive?: boolean;
    withGoBack?: boolean;
  };
  [AppStackRouteNames.ScanQR]: {
    onScan: (url: string) => boolean | Promise<boolean>;
  };
  [AppStackRouteNames.Subscription]: {
    subscription: SubscriptionModel;
  };
  [AppStackRouteNames.SetupWalletStack]: {};
  [AppStackRouteNames.BuyFiat]: {
    currency: CryptoCurrency;
    methodId: string;
  };
  [AppStackRouteNames.ModalContainer]: {};
  [AppStackRouteNames.Invoice]: {
    address: string;
    amount: number;
    currency: CryptoCurrency;
  };
  [AppStackRouteNames.Migration]: {
    fromVersion?: string;
    oldAddress: string;
    newAddress: string;
    migrationInProgress: boolean;
    oldBalance: string;
    newBalance: string;
    isTransfer: boolean;
  };
  [AppStackRouteNames.AccessConfirmation]: {};
  [AppStackRouteNames.MainAccessConfirmation]: {};
  [AppStackRouteNames.ChangePin]: {};
  [AppStackRouteNames.ResetPin]: {};
  [AppStackRouteNames.SecurityMigration]: {};
  [AppStackRouteNames.NFT]: {
    keyPair: NFTKeyPair;
  };
  [AppStackRouteNames.WebView]: {
    webViewUrl: string;
  };
};
