import { TonAPIGenerated } from './TonAPIGenerated';

type TonAPIOptions = {
  baseUrl: string | (() => string);
  token?: string | (() => string);
};

export class TonAPI extends TonAPIGenerated<any> {
  constructor(opts: TonAPIOptions) {
    super({
      baseApiParams: {
        secure: true,
      },
      securityWorker: () => {
        const baseUrl = typeof opts.baseUrl === 'function' ? opts.baseUrl() : opts.baseUrl;
        const token = typeof opts.token === 'function' ? opts.token() : opts.token;

        return {
          baseUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    });
  }
}
