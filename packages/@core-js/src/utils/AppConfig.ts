import { network } from './network';

type AppConfigStorage = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

type RequestParams = Record<string, any> | (() => Record<string, any>);

type AppConfigRequest = {
  params: RequestParams;
  host: string;
};

type AppConfigOptions<TConfig> = {
  request: AppConfigRequest;
  defaultConfig: Partial<TConfig>;
  storage: AppConfigStorage;
};

export class AppConfig<TConfig = {}> {
  private configStorageKey = '__config__';
  private defaultConfig: Partial<TConfig>;
  private request: AppConfigRequest;
  private storage: AppConfigStorage;
  private config: any = {}; // TODO: fix any

  constructor(options: AppConfigOptions<TConfig>) {
    this.defaultConfig = options.defaultConfig;
    this.request = options.request;
    this.storage = options.storage;
  }

  public async loadFromStorage() {
    try {
      const configJson = await this.storage.getItem(this.configStorageKey);
      if (configJson) {
        this.config = JSON.parse(configJson);
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

      this.setConfig(config.data);
    } catch (err) {
      console.log('[AppConfig]:', err);
    }
  }

  public async load() {
    await this.loadFromStorage();
    this.loadFromServer(); // load in backgound
  }

  public get<TKey extends keyof TConfig>(key: TKey) {
    if (this.config[key]) {
      return this.config[key];
    }

    return this.defaultConfig[key] ?? '';
  }

  private async setConfig(config: any) {
    this.config = Object.assign(this.config, config);
    return this.storage.setItem(this.configStorageKey, JSON.stringify(this.config));
  }
}
