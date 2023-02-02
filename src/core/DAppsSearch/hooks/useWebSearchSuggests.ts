import { useCallback, useEffect, useRef, useState } from 'react';
import { IWebSearchSuggest } from '../types';
import axios, { CancelTokenSource } from 'axios';
import uniq from 'lodash/uniq';
import { useBrowserStore, SearchEngine } from '$store';

const fetchGoogleSuggests = async (
  query: string,
  cancelTokenSource: CancelTokenSource,
) => {
  const url = `https://suggestqueries.google.com/complete/search?q=${encodeURIComponent(
    query,
  )}&client=firefox`;

  const response = await axios(url, { cancelToken: cancelTokenSource.token });

  const body = response.data;

  if (body && Array.isArray(body) && body.length > 1) {
    let items = body[1] as string[];

    const itemsWithQuery = uniq([query, ...items]);

    return itemsWithQuery.slice(0, 4).map((title): IWebSearchSuggest => {
      const q = !query.startsWith('=') && title.startsWith('= ') ? query : title;

      return {
        url: `https://www.google.com/search?q=${q}`,
        title,
      };
    });
  }

  return [];
};

const fetchDuckDuckGoSuggests = async (
  query: string,
  cancelTokenSource: CancelTokenSource,
) => {
  const url = `https://duckduckgo.com/ac/?kl=wt-wt&q=${encodeURIComponent(query)}`;

  const response = await axios(url, { cancelToken: cancelTokenSource.token });

  const body = response.data;

  if (body && Array.isArray(body)) {
    const items = body.map((item) => item.phrase) as string[];

    const itemsWithQuery = uniq([query, ...items]);

    return itemsWithQuery.slice(0, 4).map((title): IWebSearchSuggest => {
      return {
        url: `https://duckduckgo.com/?q=${encodeURIComponent(title)}`,
        title,
      };
    });
  }

  return [];
};

const searchFetcherMap = {
  [SearchEngine.DuckDuckGo]: fetchDuckDuckGoSuggests,
  [SearchEngine.Google]: fetchGoogleSuggests,
};

export const useWebSearchSuggests = (query: string) => {
  const searchEngine = useBrowserStore((state) => state.searchEngine);

  const [result, setResult] = useState<IWebSearchSuggest[]>([]);
  const resultRef = useRef<IWebSearchSuggest[]>([]);

  resultRef.current = result;

  const getFirstWebSuggest = useCallback((): IWebSearchSuggest | null => {
    const firstSuggest = resultRef.current[0];

    return firstSuggest ?? null;
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    const getSuggests = async (q: string) => {
      if (q.length === 0) {
        setResult([]);

        return;
      }

      try {
        const suggests = await searchFetcherMap[searchEngine](q, cancelTokenSource);

        setResult(suggests);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setResult([]);
        }
      }
    };

    getSuggests(query.trim());

    return () => {
      cancelTokenSource.cancel();
    };
  }, [query, searchEngine]);

  return { webSearchSuggests: result, getFirstWebSuggest };
};
