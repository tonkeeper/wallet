import { BackoffOptions } from "./backoff";
import { jsonToUrl } from "./network.utils";

type NetworkMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type NetworkOptions = {
  params?: Record<string, any>;
  backoff?: BackoffOptions | boolean;
  headers?: HeadersInit_ | undefined;
}

export type NetworkResponse<TData = any> = {
  statusText: string;
  headers: Record<string, any>;
  status: number;
  ok: boolean;
  data: TData;
}

function createNetworkMethod(method: NetworkMethods) {
  return async <T = any>(url: string, options: NetworkOptions): Promise<NetworkResponse<T>>  => {
    const fetchOptions: RequestInit = { method, headers: options.headers ?? {} };

    let query: string | undefined;
    if (options.params) {
      if (method === 'GET') {
        query = jsonToUrl(options.params);
      } else  {
        fetchOptions.body = JSON.stringify(options.params);
        fetchOptions.headers!['Content-Type'] = 'application/json';
      }
    }

    const endpoint = url + (query ? `?${query}` : '');
    const response = await fetch(endpoint, fetchOptions);
    let data = {} as T;
    try {
      data = await response.json();
    } catch (err) {}

    return { 
      statusText: response.statusText,
      headers: response.headers,
      status: response.status,
      ok: response.ok,
      data, 
    };
  }
}

export const network = {
  get: createNetworkMethod('GET'),
  post: createNetworkMethod('POST'),
  put: createNetworkMethod('PUT'),
  delete: createNetworkMethod('DELETE'),
};
