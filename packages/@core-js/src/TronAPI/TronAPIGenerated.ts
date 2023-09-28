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

export interface PublishPayload {
  transactionHash: string;
}

export interface RequestMessage {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  to: string;
  /** @example "10000000" */
  value: string;
  data: string;
}

export interface RequestData {
  /** @example "100000000" */
  fee: string;
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  feeToken: string;
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  feeReceiver: string;
  /** @example 10000000 */
  deadline: number;
  /** @example 10000000 */
  nonce: number;
  messages: RequestMessage[];
}

export interface EstimatePayload {
  /** @example "100000000" */
  hash: string;
  request: RequestData;
  internalMsgs: boolean[];
}

export interface FromMessage {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  to: string;
  /** @example "10000000" */
  value: string;
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  assetAddress?: string;
}

export interface Error {
  /** @example "error description" */
  error: string;
}

export interface TronToken {
  /** @example "https://static.tronscan.org/production/logo/usdtlogo.png" */
  image: string;
  /** @example "Tether USD" */
  name: string;
  /** @example "USDT" */
  symbol: string;
  /** @example "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" */
  address: string;
  /** @example 6 */
  decimals: number;
}

export interface TronSettings {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  walletImplementation: string;
  /** @example 3448148188 */
  chainId: string;
  tokens: TronToken[];
}

export interface TronWallet {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  address: string;
  /** @example 3448148188 */
  chainId: string;
  /** @example 6 */
  nonce: number;
}

export interface TronBalance {
  token: TronToken;
  /** @example "100000000" */
  weiAmount: string;
}

export interface TronBalances {
  balances: TronBalance[];
}

export interface TronFee {
  /** @example "100000000" */
  amount: string;
  token: TronToken;
}

export interface ReceiveTRC20Action {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  sender: string;
  /**
   * amount in quanta of tokens
   * @example 1000000000
   */
  amount: string;
  token: TronToken;
}

export interface SendTRC20Action {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  recipient: string;
  /**
   * amount in quanta of tokens
   * @example 1000000000
   */
  amount: string;
  token: TronToken;
}

export interface ContractDeployAction {
  /** @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n" */
  ownerAddress: string;
}

export interface TronAction {
  /** @example "ReceiveTRC20" */
  type: TronActionTypeEnum;
  /** @example "ok" */
  status: TronActionStatusEnum;
  receiveTRC20?: ReceiveTRC20Action;
  sendTRC20?: SendTRC20Action;
  contractDeploy?: ContractDeployAction;
}

export interface TronEvent {
  /** @example "e8b0e3fee4a26bd2317ac1f9952fcdc87dc08fdb617656b5202416323337372e" */
  txHash: string;
  /**
   * @format int64
   * @example 1234567890
   */
  timestamp: number;
  actions: TronAction[];
  fees?: TronFee;
  /**
   * Event is not finished yet. Transactions still happening
   * @example false
   */
  inProgress: boolean;
}

export interface TronEvents {
  events: TronEvent[];
  fingerprint?: string;
}

/** @example "ReceiveTRC20" */
export enum TronActionTypeEnum {
  ReceiveTRC20 = 'ReceiveTRC20',
  SendTRC20 = 'SendTRC20',
  ContractDeploy = 'ContractDeploy',
}

/** @example "ok" */
export enum TronActionStatusEnum {
  Ok = 'ok',
  Failed = 'failed',
  Pending = 'pending',
}

export interface GetTransactionsParams {
  fingerprint?: string;
  /**
   * @format int32
   * @max 200
   * @default 20
   * @example 15
   */
  limit?: number;
  /**
   * @format int32
   * @default 0
   * @example 10
   */
  offset?: number;
  /** @format int32 */
  min_timestamp?: number;
  /** @format int32 */
  max_timestamp?: number;
  /**
   * owner address
   * @example "TK11GsFSR7uDSA7ZNFCb6Xq6d5drUB6R7n"
   */
  ownerAddress: string;
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
  public baseUrl: string = 'https://tron.tonkeeper.com';
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
 * @title gasless TRON service REST api
 * @version 2.0.0
 * @baseUrl https://tron.tonkeeper.com
 * @contact Support <support@tonkeeper.com>
 *
 * Service to publish TRON transactions
 */
export class TronAPIGenerated<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  settings = {
    /**
     * @description Get service configuration
     *
     * @tags Tron
     * @name GetSettings
     * @request GET:/api/v2/settings
     */
    getSettings: (params: RequestParams = {}) =>
      this.http.request<
        TronSettings,
        {
          error: string;
        }
      >({
        path: `/api/v2/settings`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  wallet = {
    /**
     * @description Get user wallet address data
     *
     * @tags Tron
     * @name GetWallet
     * @request GET:/api/v2/wallet/{owner_address}
     */
    getWallet: (ownerAddress: string, params: RequestParams = {}) =>
      this.http.request<
        TronWallet,
        {
          error: string;
        }
      >({
        path: `/api/v2/wallet/${ownerAddress}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Get list of transactions
     *
     * @tags Tron
     * @name GetTransactions
     * @request GET:/api/v2/wallet/{owner_address}/transactions
     */
    getTransactions: (
      { ownerAddress, ...query }: GetTransactionsParams,
      params: RequestParams = {},
    ) =>
      this.http.request<
        TronEvents,
        {
          error: string;
        }
      >({
        path: `/api/v2/wallet/${ownerAddress}/transactions`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get transaction estimate
     *
     * @tags Tron
     * @name GetEstimation
     * @request POST:/api/v2/wallet/{owner_address}/estimate
     */
    getEstimation: (
      ownerAddress: string,
      data: {
        /** @example 10000000 */
        lifeTime: number;
        messages: FromMessage[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<
        EstimatePayload,
        {
          error: string;
        }
      >({
        path: `/api/v2/wallet/${ownerAddress}/estimate`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),

    /**
     * @description Publish transaction
     *
     * @tags Tron
     * @name PublishTransaction
     * @request POST:/api/v2/wallet/{owner_address}/publish
     */
    publishTransaction: (
      ownerAddress: string,
      data: {
        request: RequestData;
        hash: string;
        signature: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<
        PublishPayload,
        {
          error: string;
        }
      >({
        path: `/api/v2/wallet/${ownerAddress}/publish`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),
  };
  balance = {
    /**
     * @description Get wallet balance
     *
     * @tags Tron
     * @name GetWalletBalances
     * @request GET:/api/v2/balance/{wallet_address}
     */
    getWalletBalances: (walletAddress: string, params: RequestParams = {}) =>
      this.http.request<
        TronBalances,
        {
          error: string;
        }
      >({
        path: `/api/v2/balance/${walletAddress}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  transactions = {
    /**
     * @description Get transaction data
     *
     * @tags Tron
     * @name GetTransaction
     * @request GET:/api/v2/transactions/{transaction_hash}
     */
    getTransaction: (transactionHash: string, params: RequestParams = {}) =>
      this.http.request<
        TronEvent,
        {
          error: string;
        }
      >({
        path: `/api/v2/transactions/${transactionHash}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
