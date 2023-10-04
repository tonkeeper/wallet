import { TabPositionHandlerContext } from '../utils/TabPositionHandlerContext';
import { useContext } from 'react';

export const useSetTabPosition = () => {
  const setTabPosition = useContext(TabPositionHandlerContext);

  if (!setTabPosition) {
    throw new Error('No TabMeasureContext');
  }

  return setTabPosition;
};
