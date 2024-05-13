import { StakingTransactionType } from '$core/StakingSend/types';
import { AppStackRouteNames } from '$navigation';
import { CryptoCurrency } from '$shared/constants';
import { SendAnalyticsFrom, SubscriptionModel } from '$store/models';
import { NFTKeyPair } from '$store/nfts/interface';
import { CurrencyAdditionalParams, TokenType } from '$core/Send/Send.interface';

export type AppStackParamList = {
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
    isBattery?: boolean;
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
  [AppStackRouteNames.AccessConfirmation]: {};
  [AppStackRouteNames.MainAccessConfirmation]: {};
  [AppStackRouteNames.NFT]: {
    keyPair: NFTKeyPair;
  };
  [AppStackRouteNames.WebView]: {
    webViewUrl: string;
  };
  [AppStackRouteNames.StakingSend]: {
    poolAddress: string;
    transactionType: StakingTransactionType;
    amount?: string;
  };
  [AppStackRouteNames.CustomizeWallet]: {
    identifiers?: string[];
  };
  [AppStackRouteNames.BatterySend]: {
    recipient?: string;
    jettonMaster?: string;
  };
};
