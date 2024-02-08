import { AppStorage } from '@tonkeeper/shared/modules/AppStorage';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@tonkeeper/mobile/src/config/AppConfig';
import { Platform } from 'react-native';

export type AppConfigVars = {
  tonkeeperEndpoint: string;
  tonEndpoint: string;
  tonEndpointAPIKey: string;
  neocryptoWebView: string;
  supportLink: string;
  isExchangeEnabled: string;
  exchangePostUrl: string;
  mercuryoSecret: string;
  appsflyerDevKey: string;
  appsflyerAppId: string;
  tonNFTsMarketplaceEndpoint: string;
  tonapiMainnetHost: string;
  accountExplorer: string;
  subscriptionsHost: string;
  cachedMediaEndpoint: string;
  cachedMediaKey: string;
  cachedMediaSalt: string;
  NFTOnExplorerUrl: string;
  flags: Record<string, boolean>;
  directSupportUrl: string;
  tonkeeperNewsUrl: string;
  stakingInfoUrl: string;
  tonCommunityUrl: string;
  tonCommunityChatUrl: string;
  amplitudeKey: string;
  stonfiUrl: string;
  explorerUrl: string;
  featured_play_interval: number;
  tonapiIOEndpoint: string;
  tonapiV2Endpoint: string;
  tonApiV2Key: string;
  tonApiKey: string;
  transactionExplorer: string;
  tonapiTestnetHost: string;
  tronapiHost: string;
  tronapiTestnetHost: string;
  batteryHost: string;
  batteryTestnetHost: string;
  batteryMeanFees: string;
  disable_battery: boolean;
  disable_battery_iap_module: boolean;
  disable_battery_send: boolean;
  disable_show_unverified_token: boolean;
  disable_tonstakers: boolean;
};

const defaultConfig: Partial<AppConfigVars> = {
  tonkeeperEndpoint: 'https://api.tonkeeper.com',
  tonEndpoint: 'https://toncenter.com/api/v2/jsonRPC',
  supportLink: 'mailto:support@tonkeeper.com',
  explorerUrl: 'https://tonviewer.com',
  accountExplorer: 'https://tonviewer.com/%s',
  tonapiIOEndpoint: 'https://keeper.tonapi.io',
  tonapiV2Endpoint: 'https://tonapi.io',
  subscriptionsHost: 'https://api.tonkeeper.com',
  tonapiMainnetHost: 'https://tonapi.io',
  tonapiTestnetHost: 'https://testnet.tonapi.io',
  NFTOnExplorerUrl: 'https://tonscan.org/nft/%s',
  transactionExplorer: 'https://tonviewer.com/transaction/%s',
  flags: {},
  tronapiHost: 'https://tron.tonkeeper.com',
  tronapiTestnetHost: 'https://testnet-tron.tonkeeper.com',
  batteryHost: 'https://battery.tonkeeper.com',
  batteryTestnetHost: 'https://testnet-battery.tonkeeper.com',
  batteryMeanFees: '0.08',
  disable_battery: true,
  disable_battery_iap_module: true,
  disable_battery_send: true,
  disable_show_unverified_token: false,
  disable_tonstakers: false,
};

export const config = new AppConfig<AppConfigVars>({
  storage: new AppStorage(),
  defaultConfig,
  request: {
    host: 'https://boot.tonkeeper.com/keys/all',
    params: () => ({
      build: DeviceInfo.getVersion(),
      platform: Platform.OS,
    }),
  },
});
