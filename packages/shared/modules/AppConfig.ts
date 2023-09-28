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
  private clientConfigStorageKey = '__client-config__';
  private serverConfigStorageKey = '__server-config__';
  private clientConfig: Partial<TConfig> = {};
  private serverConfig: Partial<TConfig> = {};
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

  public async load() {
    await this.loadFromStorage();
    this.loadFromServer(); // load in backgound
  }

  public server = {
    get: <TKey extends keyof TConfig>(key: TKey) => {
      if (this.serverConfig[key] !== undefined) {
        return this.serverConfig[key];
      }

      return this.defaultConfig[key] ?? '';
    },
  };

  public get<TKey extends keyof TConfig>(key: TKey): TConfig[TKey] {
    if (this.clientConfig[key]) {
      return this.clientConfig[key]!;
    }

    if (this.serverConfig[key]) {
      return this.serverConfig[key]!;
    }

    return this.defaultConfig[key]! ?? '';
  }

  private async saveServerConfig(config: Partial<TConfig>) {
    const mergedConfig = Object.assign(this.serverConfig, config);
    this.serverConfig = mergedConfig;
    return this.storage.setItem(
      this.serverConfigStorageKey,
      JSON.stringify(this.serverConfig),
    );
  }

  public set(config: Partial<TConfig>) {
    this.clientConfig = Object.assign(this.clientConfig, config);
    return this.storage.setItem(
      this.clientConfigStorageKey,
      JSON.stringify(this.clientConfig),
    );
  }
}
