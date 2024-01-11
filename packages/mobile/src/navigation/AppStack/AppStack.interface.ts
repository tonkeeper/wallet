import { StakingTransactionType } from '$core/StakingSend/types';
import { AppStackRouteNames } from '$navigation';
import { CryptoCurrency } from '$shared/constants';
import { SendAnalyticsFrom, SubscriptionModel } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';

export type AppStackParamList = {
  [AppStackRouteNames.Intro]: {};
  [AppStackRouteNames.MainStack]: {};
  [AppStackRouteNames.Receive]: {
    currency: CryptoCurrency;
    tokenType?: TokenType;
    jettonAddress?: string;
    isFromMainScreen?: boolean;
  };
  [AppStackRouteNames.NFTSend]: {
    nftAddress: string;
  };
  [AppStackRouteNames.Send]: {
    currency?: CryptoCurrency | string;
    address?: string;
    comment?: string;
    amount?: string;
    fee?: string;
    isInactive?: boolean;
    withGoBack?: boolean;
    from?: SendAnalyticsFrom;
    expiryTimestamp?: number | null;
    redirectToActivity?: boolean;
    tokenType?: TokenType;
    currencyAdditionalParams?: CurrencyAdditionalParams;
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
  [AppStackRouteNames.StakingSend]: {
    poolAddress: string;
    transactionType: StakingTransactionType;
  };
};
