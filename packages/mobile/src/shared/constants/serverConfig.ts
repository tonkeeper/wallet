export interface ServerConfig {
  _version: number;
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
  tonapiIOEndpoint: string;
  tonapiMainnetHost: string;
  accountExplorer: string;
  subscriptionsHost: string;
  tonapiTestnetHost: string;
  tonApiKey: string;
  tonApiV2Key: string;
  tonapiV2Endpoint: string;
  cachedMediaEndpoint: string;
  cachedMediaKey: string;
  cachedMediaSalt: string;
  NFTOnExplorerUrl: string;
  transactionExplorer: string;
  flags: Record<string, boolean>;
  directSupportUrl: string;
  tonkeeperNewsUrl: string;
  stakingInfoUrl: string;
  tonCommunityUrl: string;
  tonCommunityChatUrl: string;
  amplitudeKey: string;
  stonfiUrl: string;
}

let config: ServerConfig | null = null;

export function setServerConfig(data: any, isTestnet: boolean) {
  config = {
    _version: 0,
    tonkeeperEndpoint: data.tonkeeperEndpoint || 'https://api.tonkeeper.com',
    tonEndpoint: data.tonEndpoint || 'https://toncenter.com/api/v2/jsonRPC',
    tonEndpointAPIKey: data.tonEndpointAPIKey,
    neocryptoWebView: data.neocryptoWebView,
    supportLink: data.supportLink || 'mailto:support@tonkeeper.com',
    isExchangeEnabled: data.isExchangeEnabled,
    exchangePostUrl: data.exchangePostUrl,
    mercuryoSecret: data.mercuryoSecret,
    accountExplorer: data.accountExplorer || 'https://tonviewer.com/%s',
    appsflyerDevKey: data.appsflyerDevKey,
    appsflyerAppId: data.appsflyerAppId,
    tonNFTsMarketplaceEndpoint: data.tonNFTsMarketplaceEndpoint,
    tonapiIOEndpoint: data.tonapiIOEndpoint || 'https://keeper.tonapi.io',
    tonapiV2Endpoint: data.tonapiV2Endpoint || 'https://tonapi.io',
    tonApiKey: data.tonApiKey,
    tonApiV2Key: data.tonApiV2Key,
    subscriptionsHost: data.subscriptionsHost || 'https://api.tonkeeper.com',
    tonapiMainnetHost: data.tonapiMainnetHost || 'https://tonapi.io',
    tonapiTestnetHost: data.tonapiTestnetHost || 'https://testnet.tonapi.io',
    cachedMediaEndpoint: data.cachedMediaEndpoint,
    cachedMediaKey: data.cachedMediaKey,
    cachedMediaSalt: data.cachedMediaSalt,
    NFTOnExplorerUrl: data.NFTOnExplorerUrl || 'https://tonscan.org/nft/%s',
    directSupportUrl: data.directSupportUrl,
    tonkeeperNewsUrl: data.tonkeeperNewsUrl,
    stakingInfoUrl: data.stakingInfoUrl,
    tonCommunityUrl: data.tonCommunityUrl,
    tonCommunityChatUrl: data.tonCommunityChatUrl,
    transactionExplorer:
      data.transactionExplorer || 'https://tonviewer.com/transaction/%s',
    flags: data.flags || {},
    amplitudeKey: data.amplitudeKey,
    stonfiUrl: data.stonfiUrl,
  };
}

export function updateServerConfig(jsonConfig: any) {
  if (!jsonConfig) {
    return;
  }
  try {
    Object.entries(JSON.parse(jsonConfig)).map(([key, value]) => {
      if (config) {
        config[key] = value;
      }
    });
  } catch (e) {}
}

export function isServerConfigLoaded() {
  return !!config;
}

export function getServerConfig<T extends keyof ServerConfig>(key: T): ServerConfig[T] {
  if (!config) {
    throw new Error('Config is not loaded');
  }

  return config[key];
}

export function getServerConfigSafe<T extends keyof ServerConfig>(
  key: T,
): ServerConfig[T] | 'none' {
  return config ? config[key] : 'none';
}
