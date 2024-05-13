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

export interface Error {
  /** @example "error description" */
  error: string;
}

export interface Status {
  pending_transactions: {
    id: string;
  }[];
}

export interface Config {
  /**
   * with zero balance it is possible to transfer some jettons (stablecoins, jusdt, etc) to this address to refill the balance. Such transfers would be paid by Battery Service.
   * @example "0:07331e629e39d006d86a8cc7659c10a97c671f7535dc8b7f251a1a944dda348e"
   */
  fund_receiver: string;
  /**
   * when building a message to transfer an NFT or Jetton, use this address to send excess funds back to Battery Service.
   * @example "0:da6b1b6663a0e4d18cc8574ccd9db5296e367dd9324706f3bbd9eb1cd2caf0bf"
   */
  excess_account: string;
}

export interface Balance {
  /** @example "10.250" */
  balance: string;
  /**
   * reserved amount in units (TON/USD)
   * @example "0.3"
   */
  reserved: string;
  /** @example "usd" */
  units: BalanceUnitsEnum;
}

export interface RechargeMethods {
  methods: {
    /** @example "https://example.com/image.png" */
    image?: string;
    jetton_master?: string;
    /** @example "10.0" */
    min_bootstrap_value?: string;
    type: RechargeMethodsTypeEnum;
    /** @example "10.250" */
    rate: string;
    /** @example "usdt" */
    symbol: string;
    /** @example 6 */
    decimals: number;
  }[];
}

export interface Purchases {
  /** @example 1 */
  total_purchases: number;
  /**
   * if set, then there are more purchases to be loaded. Use this value as offset parameter in the next request.
   * @example 10
   */
  next_offset?: number;
  purchases: {
    /** @example 2 */
    id: number;
    /** @example "android" */
    type: PurchasesTypeEnum;
    /** @example "10.250" */
    value: string;
    /** @example "2006-01-02T15:04:05Z07:00" */
    datetime: string;
  }[];
}

export interface AndroidBatteryPurchaseStatus {
  purchases: {
    /** @example "1000000790000000" */
    product_id: string;
    /** @example "1000000790000000" */
    token: string;
    /** @example true */
    success: boolean;
    error?: {
      /** @example "Temporary error. Try again later." */
      msg: string;
      /** @example "invalid-product-id" */
      code: AndroidBatteryPurchaseStatusCodeEnum;
    };
  }[];
}

export type AppStoreResponse = object;

export interface IOSBatteryPurchaseStatus {
  transactions: {
    /** @example "1000000790000000" */
    transaction_id: string;
    /** @example true */
    success: boolean;
    error?: {
      /** @example "Temporary error. Try again later." */
      msg: string;
      /** @example "invalid-bundle-id" */
      code: IOsBatteryPurchaseStatusCodeEnum;
    };
  }[];
}

export interface PromoCodeBatteryPurchaseStatus {
  /** @example "10.250" */
  balance_change: string;
  /** @example true */
  success: boolean;
  error?: {
    /** @example "Temporary error. Try again later." */
    msg: string;
    /** @example "promo-code-not-found" */
    code: PromoCodeBatteryPurchaseStatusCodeEnum;
  };
}

export interface Transactions {
  /** @example 1 */
  total_transactions: number;
  /**
   * if set, then there are more transactions to be loaded. Use this value as offset parameter in the next request.
   * @example 10
   */
  next_offset?: number;
  transactions: {
    id: string;
    /**
     * represents the amount of money paid by the user for this transaction.
     * @example "10.250"
     */
    paid_amount: string;
    /** @example "10.250" */
    status: TransactionsStatusEnum;
    /** @example "2006-01-02T15:04:05Z07:00" */
    created_at: string;
  }[];
}

/** @example "usd" */
export enum BalanceUnitsEnum {
  Usd = 'usd',
  Ton = 'ton',
}

export enum RechargeMethodsTypeEnum {
  Jetton = 'jetton',
  Ton = 'ton',
}

/** @example "android" */
export enum PurchasesTypeEnum {
  RegularPurchase = 'regular-purchase',
  PromoCode = 'promo-code',
}

/** @example "invalid-product-id" */
export enum AndroidBatteryPurchaseStatusCodeEnum {
  InvalidProductId = 'invalid-product-id',
  UserNotFound = 'user-not-found',
  PurchaseIsAlreadyUsed = 'purchase-is-already-used',
  TemporaryError = 'temporary-error',
  Unknown = 'unknown',
}

/** @example "invalid-bundle-id" */
export enum IOsBatteryPurchaseStatusCodeEnum {
  InvalidBundleId = 'invalid-bundle-id',
  InvalidProductId = 'invalid-product-id',
  UserNotFound = 'user-not-found',
  PurchaseIsAlreadyUsed = 'purchase-is-already-used',
  TemporaryError = 'temporary-error',
  Unknown = 'unknown',
}

/** @example "promo-code-not-found" */
export enum PromoCodeBatteryPurchaseStatusCodeEnum {
  PromoCodeNotFound = 'promo-code-not-found',
  PromoExceededAttempts = 'promo-exceeded-attempts',
  TemporaryError = 'temporary-error',
}

/** @example "10.250" */
export enum TransactionsStatusEnum {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export interface GetBalanceParams {
  /** @default "usd" */
  units?: UnitsEnum;
}

/** @default "usd" */
export enum UnitsEnum {
  Usd = 'usd',
  Ton = 'ton',
}

/** @default "usd" */
export enum GetBalanceParams1UnitsEnum {
  Usd = 'usd',
  Ton = 'ton',
}

export interface GetPurchasesParams {
  /**
   * @max 1000
   * @default 1000
   */
  limit?: number;
  /** @default 0 */
  offset?: number;
}

export interface GetTransactionsParams {
  /**
   * @max 1000
   * @default 1000
   */
  limit?: number;
  /** @default 0 */
  offset?: number;
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
  public baseUrl: string = 'https://battery.tonkeeper.com';
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
 * @title Custodial-Battery REST API.
 * @version 0.0.1
 * @baseUrl https://battery.tonkeeper.com
 * @contact Support <support@tonkeeper.com>
 *
 * REST API for Custodial Battery which provides gas to different networks to help execute transactions.
 */
export class BatteryGenerated<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description This method returns information about the current status of Battery Service.
   *
   * @name GetStatus
   * @request GET:/status
   */
  getStatus = (params: RequestParams = {}) =>
    this.http.request<Status, Error>({
      path: `/status`,
      method: 'GET',
      format: 'json',
      ...params,
    });

  /**
   * @description This method returns information about Battery Service.
   *
   * @name GetConfig
   * @request GET:/config
   */
  getConfig = (params: RequestParams = {}) =>
    this.http.request<Config, Error>({
      path: `/config`,
      method: 'GET',
      format: 'json',
      ...params,
    });

  /**
   * @description This method returns information about a user's balance.
   *
   * @name GetBalance
   * @request GET:/balance
   */
  getBalance = (query: GetBalanceParams, params: RequestParams = {}) =>
    this.http.request<Balance, Error>({
      path: `/balance`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });

  /**
   * @description Send message to blockchain
   *
   * @name SendMessage
   * @request POST:/message
   */
  sendMessage = (
    data: {
      /** @example "te6ccgECBQEAARUAAkWIAWTtae+KgtbrX26Bep8JSq8lFLfGOoyGR/xwdjfvpvEaHg" */
      boc: string;
    },
    params: RequestParams = {},
  ) =>
    this.http.request<void, Error>({
      path: `/message`,
      method: 'POST',
      body: data,
      ...params,
    });

  /**
   * @description This method returns on-chain recharge methods.
   *
   * @name GetRechargeMethods
   * @request GET:/recharge-methods
   */
  getRechargeMethods = (params: RequestParams = {}) =>
    this.http.request<RechargeMethods, Error>({
      path: `/recharge-methods`,
      method: 'GET',
      format: 'json',
      ...params,
    });

  /**
   * @description This method returns a list of purchases made by a specific user.
   *
   * @name GetPurchases
   * @request GET:/purchases
   */
  getPurchases = (query: GetPurchasesParams, params: RequestParams = {}) =>
    this.http.request<Purchases, Error>({
      path: `/purchases`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });

  /**
   * @description This method returns a list of transactions made by a specific user.
   *
   * @name GetTransactions
   * @request GET:/transactions
   */
  getTransactions = (query: GetTransactionsParams, params: RequestParams = {}) =>
    this.http.request<Transactions, Error>({
      path: `/transactions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });

  emulate = {
    /**
     * @description Emulate sending message to blockchain
     *
     * @tags Emulation
     * @name EmulateMessageToWallet
     * @request POST:/wallet/emulate
     */
    emulateMessageToWallet: (
      data: {
        /** @example "te6ccgECBQEAARUAAkWIAWTtae+KgtbrX26Bep8JSq8lFLfGOoyGR/xwdjfvpvEaHg" */
        boc: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<any, Error>({
        path: `/wallet/emulate`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),
  };
  android = {
    /**
     * @description verify an in-app purchase
     *
     * @name AndroidBatteryPurchase
     * @request POST:/purchase-battery/android
     */
    androidBatteryPurchase: (
      data: {
        purchases: {
          /** @example "0:2cf3b5b8c891e517c9addbda1c0386a09ccacbb0e3faf630b51cfc8152325acb" */
          token: string;
          /** @example "0:2cf3b5b8c891e517c9addbda1c0386a09ccacbb0e3faf630b51cfc8152325acb" */
          product_id: string;
        }[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<AndroidBatteryPurchaseStatus, Error>({
        path: `/purchase-battery/android`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),
  };
  ios = {
    /**
     * No description
     *
     * @name AppStoreNotification
     * @request POST:/purchase-battery/ios/app-store-notification
     */
    appStoreNotification: (
      data: {
        signedPayload: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<AppStoreResponse, Error>({
        path: `/purchase-battery/ios/app-store-notification`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),

    /**
     * @description verify an in-app purchase
     *
     * @name IosBatteryPurchase
     * @request POST:/purchase-battery/ios
     */
    iosBatteryPurchase: (
      data: {
        transactions: {
          id: string;
        }[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<IOSBatteryPurchaseStatus, Error>({
        path: `/purchase-battery/ios`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),
  };
  promoCode = {
    /**
     * @description charge battery with promo code
     *
     * @name PromoCodeBatteryPurchase
     * @request POST:/purchase-battery/promo-code
     */
    promoCodeBatteryPurchase: (
      data: {
        /** @example "1234567890" */
        promo_code: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<PromoCodeBatteryPurchaseStatus, Error>({
        path: `/purchase-battery/promo-code`,
        method: 'POST',
        body: data,
        format: 'json',
        ...params,
      }),
  };
}
