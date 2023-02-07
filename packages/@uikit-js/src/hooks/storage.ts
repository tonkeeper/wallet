import { IStorage, MemoryStorage } from '@tonkeeper/core-js/src/Storage';
import React, { useContext } from 'react';

export const StorageContext = React.createContext<IStorage>(
  new MemoryStorage()
);

export const useStorage = () => {
  return useContext(StorageContext);
};
