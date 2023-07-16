type TonAPIToken = string | (() => string);
type TonAPIHost = string | (() => string);

type TonAPIOptions = {
  token: TonAPIToken;
  host: TonAPIHost;
}

export class TonAPI {
  private token: TonAPIToken;
  private host: TonAPIHost;
  
  constructor(options: TonAPIOptions) {
    this.token = options.token;
    this.host = options.host;
  }

  
}