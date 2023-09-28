import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError(err) {},
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});
