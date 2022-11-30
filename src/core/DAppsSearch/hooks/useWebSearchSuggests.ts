import { useCallback, useEffect, useRef, useState } from 'react';
import { IWebSearchSuggest } from '../types';
import axios, { CancelTokenSource } from 'axios';

const fetchGoogleSuggests = async (
  query: string,
  cancelTokenSource: CancelTokenSource,
) => {
  try {
    const url = `https://suggestqueries.google.com/complete/search?q=${encodeURIComponent(
      query,
    )}&client=firefox`;

    const response = await axios(url, { cancelToken: cancelTokenSource.token });

    const body = response.data;

    if (body && Array.isArray(body) && body.length > 1) {
      let items = body[1] as string[];

      if (!items.includes(query)) {
        items = [...items, query];
      }

      return items.slice(0, 4).map((title): IWebSearchSuggest => {
        const q = !query.startsWith('=') && title.startsWith('= ') ? query : title;

        return {
          url: `https://www.google.com/search?q=${q}`,
          title,
        };
      });
    }
  } catch {}

  return [];
};

export const useWebSearchSuggests = (query: string) => {
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

      const suggests = await fetchGoogleSuggests(q, cancelTokenSource);

      setResult(suggests);
    };

    getSuggests(query.trim());

    return () => {
      cancelTokenSource.cancel();
    };
  }, [query]);

  return { webSearchSuggests: result, getFirstWebSuggest };
};
