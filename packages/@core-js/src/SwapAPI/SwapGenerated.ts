/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum CalculateSwapProviderEnum {
  Stonfi = 'stonfi',
}

export enum CalculateSwapProviderEnum1 {
  Dedust = 'dedust',
}

export interface CalculateSwapParams {
  /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
  fromAsset: string;
  /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
  toAsset: string;
  /** @pattern ^\d+$ */
  fromAmount: string;
  /** @pattern ^(-1|0):[0-9a-fA-F]{64}$ */
  referral?: string;
  provider: ProviderEnum | ProviderEnum1;
}

export enum ProviderEnum {
  Dedust = 'dedust',
}

export enum ProviderEnum1 {
  Stonfi = 'stonfi',
}

export enum CalculateSwapParams1ProviderEnum {
  Dedust = 'dedust',
}

export enum CalculateSwapParams1ProviderEnum1 {
  Stonfi = 'stonfi',
}

export enum EncodeSwapProviderEnum {
  Dedust = 'dedust',
}

export enum EncodeSwapProviderEnum1 {
  Stonfi = 'stonfi',
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(
      typeof value === 'number' ? value : `${value}`,
    )}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal:
          (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) ||
          null,
        body:
          typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title Tonkeeper DEX service
 * @version 1.0.0
 *
 * Tonkeeper DEX service backend
 */
export class SwapGenerated<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  swap = {
    /**
     * No description
     *
     * @tags swap
     * @name CalculateSwap
     * @request GET:/v2/swap/calculate
     */
    calculateSwap: (query: CalculateSwapParams, params: RequestParams = {}) =>
      this.http.request<
        | {
            provider: CalculateSwapProviderEnum;
            trades: ({
              /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
              fromAsset: string;
              /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
              toAsset: string;
              /** @pattern ^\d+$ */
              fromAmount: string;
              /** @pattern ^\d+$ */
              toAmount: string;
              /** @pattern ^\d+$ */
              blockchainFee: string;
              path: string[];
            } & {
              /** Value that should be passed to stonfiTrade property in encode api method */
              stonfiRawTrade: {
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                fromAsset: string;
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                toAsset: string;
                /** @pattern ^\d+$ */
                fromAmount: string;
                /** @pattern ^\d+$ */
                toAmount: string;
              };
            })[];
          }
        | {
            provider: CalculateSwapProviderEnum1;
            trades: ({
              /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
              fromAsset: string;
              /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
              toAsset: string;
              /** @pattern ^\d+$ */
              fromAmount: string;
              /** @pattern ^\d+$ */
              toAmount: string;
              /** @pattern ^\d+$ */
              blockchainFee: string;
              path: string[];
            } & {
              /** Value that should be passed to dedustTrade property in encode api method */
              dedustRawTrade: {
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                fromAsset: string;
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                toAsset: string;
                /** @pattern ^\d+$ */
                fromAmount: string;
                /** @pattern ^\d+$ */
                toAmount: string;
                /** @pattern ^(-1|0):[0-9a-fA-F]{64}$ */
                poolAddress: string;
              }[];
            })[];
          },
        string
      >({
        path: `/v2/swap/calculate`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags swap
     * @name EncodeSwap
     * @request POST:/v2/swap/encode
     */
    encodeSwap: (
      data: {
        swap:
          | {
              provider: EncodeSwapProviderEnum;
              dedustTrade: {
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                fromAsset: string;
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                toAsset: string;
                /** @pattern ^\d+$ */
                fromAmount: string;
                /** @pattern ^\d+$ */
                toAmount: string;
                /** @pattern ^(-1|0):[0-9a-fA-F]{64}$ */
                poolAddress: string;
              }[];
            }
          | {
              provider: EncodeSwapProviderEnum1;
              stonfiTrade: {
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                fromAsset: string;
                /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
                toAsset: string;
                /** @pattern ^\d+$ */
                fromAmount: string;
                /** @pattern ^\d+$ */
                toAmount: string;
              };
            };
        options: {
          senderAddress: string;
          referralAddress?: string;
          /** @pattern ^(\d+\.)?\d+$ */
          slippage: string;
        };
      },
      params: RequestParams = {},
    ) =>
      this.http.request<
        {
          value: string;
          to: string;
          body: string;
        },
        string
      >({
        path: `/v2/swap/encode`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags swap
     * @name SwapGas
     * @request GET:/v2/swap/gas
     */
    swapGas: (params: RequestParams = {}) =>
      this.http.request<
        {
          dedust: {
            tonToJetton: string;
            jettonToTon: string;
            jettonToJetton: string;
          };
          stonfi: {
            tonToJetton: string;
            jettonToTon: string;
            jettonToJetton: string;
          };
        },
        string
      >({
        path: `/v2/swap/gas`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags swap
     * @name SwapAssets
     * @request GET:/v2/swap/assets
     */
    swapAssets: (params: RequestParams = {}) =>
      this.http.request<
        {
          symbol: string;
          name: string;
          decimals: number;
          /** @pattern ^(ton|(-1|0):[0-9a-fA-F]{64})$ */
          address: string;
          image: string;
        }[],
        string
      >({
        path: `/v2/swap/assets`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
