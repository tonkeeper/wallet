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

export interface Balance {
  /** @example "10.250" */
  balance: string;
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
   * @description This method returns information about a battery
   *
   * @name GetBalance
   * @request GET:/balance
   */
  getBalance = (params: RequestParams = {}) =>
    this.http.request<Balance, Error>({
      path: `/balance`,
      method: 'GET',
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
}
