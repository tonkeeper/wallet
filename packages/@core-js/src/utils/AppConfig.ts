import { network } from './network';

type RequestParams = Record<string, any> | (() => Record<string, any>);

type AppConfigRequest = {
  params: RequestParams;
  host: string;
}

type AppConfigOptions<TConfig> = {
  request: AppConfigRequest;
  defaultConfig: Partial<TConfig>;
}

export class AppConfig<TConfig = {}> {
  private defaultConfig: Partial<TConfig>;
  private request: AppConfigRequest;

  // private confisg: TConfig = {};

  constructor(options: AppConfigOptions<TConfig>) {
    this.defaultConfig = options.defaultConfig;
    this.request = options.request;    
  }

  public loadFromStorage() {
    
  }

  public async loadFromServer() {
    const params = typeof this.request.params === 'function' 
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
  }

  public load() {

  }

  public get<TKey extends keyof TConfig>(key: TKey) {
    return this.defaultConfig[key]!
  }

  private setConfig(config: any) {

  } 
}
