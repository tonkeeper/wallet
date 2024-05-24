import { AppStorage } from '@tonkeeper/shared/modules/AppStorage';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from './AppConfig';
import { Platform } from 'react-native';
import { i18n } from '@tonkeeper/shared/i18n';

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
  telegram_ru: string;
  telegram_global: string;
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
  tonapiWsEndpoint: string;
  tonapiTestnetWsEndpoint: string;
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
  batteryRefundEndpoint: string;
  batteryMeanFees: string;
  batteryReservedAmount: string;
  batteryMaxInputAmount: string;
  batteryMeanPrice_swap: string;
  batteryMeanPrice_jetton: string;
  batteryMeanPrice_nft: string;

  scamEndpoint: string;

  holdersAppEndpoint: string;
  holdersService: string;
  aptabaseEndpoint: string;
  aptabaseAppKey: string;
  disable_battery: boolean;
  battery_beta: boolean;
  disable_battery_iap_module: boolean;
  disable_battery_send: boolean;
  disable_show_unverified_token: boolean;
  disable_battery_promo_module: boolean;
  disable_battery_crypto_recharge_module: boolean;
  disable_signer: boolean;
  disable_tonstakers: boolean;
  disable_holders_cards: boolean;
  exclude_jetton_chart_periods: boolean;
  devmode_enabled: boolean;

  signer_store_url: string;
  signer_about_url: string;

  tonkeeper_pro_url: string;
  notcoin_jetton_master: string;
  notcoin_nft_collection: string;
  notcoin_bot_url: string;
  notcoin_burn_addresses: string[];
  notcoin_burn_date: number;
  notcoin_burn: boolean;
};

const defaultConfig: Partial<AppConfigVars> = {
  tonkeeperEndpoint: 'https://api.tonkeeper.com',
  tonEndpoint: 'https://toncenter.com/api/v2/jsonRPC',
  supportLink: 'mailto:support@tonkeeper.com',
  explorerUrl: 'https://tonviewer.com',
  accountExplorer: 'https://tonviewer.com/%s',
  tonapiWsEndpoint: 'wss://tonapi.io/v2/websocket',
  tonapiTestnetWsEndpoint: 'wss://testnet.tonapi.io/v2/websocket',
  tonapiIOEndpoint: 'https://keeper.tonapi.io',
  tonapiV2Endpoint: 'https://tonapi.io',
  subscriptionsHost: 'https://api.tonkeeper.com',
  tonapiMainnetHost: 'https://tonapi.io',
  tonapiTestnetHost: 'https://testnet.tonapi.io',
  NFTOnExplorerUrl: 'https://tonscan.org/nft/%s',
  transactionExplorer: 'https://tonviewer.com/transaction/%s',
  flags: {},
  holdersAppEndpoint: 'https://tonkeeper-dev.holders.io/',
  holdersService: 'https://card-dev.whales-api.com',
  tronapiHost: 'https://tron.tonkeeper.com',
  tronapiTestnetHost: 'https://testnet-tron.tonkeeper.com',

  batteryHost: 'https://battery.tonkeeper.com',
  batteryTestnetHost: 'https://testnet-battery.tonkeeper.com',
  batteryRefundEndpoint: 'https://battery-refund-app.vercel.app',
  batteryMeanFees: '0.0055',
  batteryReservedAmount: '0.3',
  batteryMaxInputAmount: '3',
  batteryMeanPrice_swap: '0.22',
  batteryMeanPrice_jetton: '0.06',
  batteryMeanPrice_nft: '0.03',
  battery_beta: true,
  disable_battery: false,
  disable_battery_send: false,
  disable_battery_iap_module: Platform.OS === 'android', // Enable for iOS, disable for Android
  disable_battery_promo_module: true,
  disable_battery_crypto_recharge_module: false,
  disable_signer: true,

  scamEndpoint: 'https://scam.tonkeeper.com',

  telegram_global: 'https://t.me/tonkeeper_news',
  telegram_ru: 'https://t.me/tonkeeper_ru',

  disable_show_unverified_token: false,
  disable_tonstakers: false,
  disable_holders_cards: true,
  exclude_jetton_chart_periods: true,
  devmode_enabled: false,

  signer_store_url: 'https://play.google.com/store/apps/details?id=com.tonapps.signer',
  signer_about_url: 'https://tonkeeper.com',

  tonkeeper_pro_url: 'https://tonkeeper.com/pro',
  notcoin_jetton_master:
    '0:2f956143c461769579baef2e32cc2d7bc18283f40d20bb03e432cd603ac33ffc',
  notcoin_nft_collection:
    '0:e6923eb901bfe6d1a65a5bc2292b0e2462a220213c3f1d1b2d60491543a34860',
  notcoin_bot_url: 'https://t.me/notcoin_bot',
};

export const config = new AppConfig<AppConfigVars>({
  storage: new AppStorage(),
  defaultConfig,
  request: {
    host: 'https://boot.tonkeeper.com/keys/all',
    params: () => ({
      build: DeviceInfo.getVersion(),
      platform: Platform.OS,
      lang: i18n.locale,
    }),
  },
});
