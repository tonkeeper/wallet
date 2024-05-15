import { network, Storage } from '@tonkeeper/core';

type RequestParams = Record<string, any> | (() => Record<string, any>);

type AppConfigRequest = {
  params: RequestParams;
  host: string;
};

type AppConfigOptions<TConfig> = {
  request: AppConfigRequest;
  defaultConfig: Partial<TConfig>;
  storage: Storage;
};

export class AppConfig<TConfig = {}> {
  static readonly CONFIG_VERSION = 4; // change it, if config needs to be force updated

  private clientConfigStorageKey = `__client-config__v${AppConfig.CONFIG_VERSION}`;
  private serverConfigStorageKey = `__server-config__v${AppConfig.CONFIG_VERSION}`;
  private clientConfig: Record<'mainnet' | 'testnet', Partial<TConfig>> = {
    mainnet: {},
    testnet: {},
  };
  private serverConfig: Record<'mainnet' | 'testnet', Partial<TConfig>> = {
    mainnet: {},
    testnet: {},
  };
  private defaultConfig: Partial<TConfig>;
  private request: AppConfigRequest;
  private storage: Storage;

  constructor(options: AppConfigOptions<TConfig>) {
    this.defaultConfig = options.defaultConfig;
    this.request = options.request;
    this.storage = options.storage;
  }

  public async loadFromStorage() {
    try {
      const serverConfigString = await this.storage.getItem(this.serverConfigStorageKey);
      if (serverConfigString) {
        this.serverConfig = JSON.parse(serverConfigString);
      }
      const clientConfigString = await this.storage.getItem(this.clientConfigStorageKey);
      if (clientConfigString) {
        this.clientConfig = JSON.parse(clientConfigString);
      }
    } catch (err) {
      console.log('[AppConfig]: error', err);
    }
  }

  public async loadFromServer() {
    try {
      const params =
        typeof this.request.params === 'function'
          ? this.request.params()
          : this.request.params;

      const config = await network.get(this.request.host, {
        params,
        backoff: {
          attempt: 1000,
          delay: 1000,
        },
      });

      this.saveServerConfig(config.data);
    } catch (err) {
      console.log('[AppConfig]:', err);
    }
  }

  public get isLoaded() {
    return Object.keys(this.serverConfig.mainnet).length > 0;
  }

  public async load() {
    await this.loadFromStorage();

    if (!this.isLoaded) {
      await this.loadFromServer(); // initial fetch
    } else {
      this.loadFromServer(); // refresh in backgound
    }
  }

  public server = {
    get: <TKey extends keyof TConfig>(key: TKey, isTestnet = false): TConfig[TKey] => {
      const config = isTestnet ? this.serverConfig.testnet : this.serverConfig.mainnet;

      if (config[key] !== undefined) {
        return config[key]!;
      }

      return this.defaultConfig[key]!;
    },
  };

  public get<TKey extends keyof TConfig>(key: TKey, isTestnet = false): TConfig[TKey] {
    const clientConfig = isTestnet
      ? this.clientConfig.testnet
      : this.clientConfig.mainnet;
    if (clientConfig[key] !== undefined) {
      return clientConfig[key]!;
    }

    return this.server.get(key, isTestnet);
  }

  private async saveServerConfig(
    config: Record<'mainnet' | 'testnet', Partial<TConfig>>,
  ) {
    const mergedConfig = Object.assign(this.serverConfig, config);
    this.serverConfig = mergedConfig;
    return this.storage.setItem(
      this.serverConfigStorageKey,
      JSON.stringify(this.serverConfig),
    );
  }

  public set(config: Partial<TConfig>, isTestnet = false) {
    if (isTestnet) {
      this.clientConfig.testnet = Object.assign(this.clientConfig.testnet, config);
    } else {
      this.clientConfig.mainnet = Object.assign(this.clientConfig.mainnet, config);
    }
    return this.storage.setItem(
      this.clientConfigStorageKey,
      JSON.stringify(this.clientConfig),
    );
  }
}
