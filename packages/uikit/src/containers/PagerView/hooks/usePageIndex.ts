import { createContext, useContext } from 'react';

export const PageIndexContext = createContext<number | null>(null);
export const usePageIndex = () => {
  const tab = useContext(PageIndexContext);

  if (tab === null) {
    throw new Error('No PageIndexContext');
  }

  return tab;
};
