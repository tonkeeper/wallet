import {
  ApiConfig,
  ContentType,
  FullRequestParams,
  QueryParamsType,
  RequestParams,
} from './TonAPIGenerated';

type CancelToken = Symbol | string | number;

export type HttpClientOptions = {
  baseUrl: string | (() => string);
  baseHeaders?: { [key: string]: string } | (() => { [key: string]: string });
};

export class HttpClient {
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private options: HttpClientOptions;

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(options: HttpClientOptions) {
    this.options = options;
  }

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

  public request = async <T = any>({
    body,
    path,
    query,
    format,
    type,
    cancelToken,
    method,
    headers,
  }: FullRequestParams): Promise<T> => {
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];

    const baseUrl =
      typeof this.options.baseUrl === 'function'
        ? this.options.baseUrl()
        : this.options.baseUrl;
    const baseHeaders =
      typeof this.options.baseHeaders === 'function'
        ? this.options.baseHeaders()
        : this.options.baseHeaders;

    const response = await this.customFetch(
      `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(baseHeaders ?? {}),
          ...(headers ?? {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : null,
        body:
          typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    );

    if (cancelToken) {
      this.abortControllers.delete(cancelToken);
    }

    const data = await response[format || 'json']();

    if (!response.ok) {
      throw data;
    }

    return data;
  };
}
