import { createContext, useContext } from 'react';

export const ModalBehaviorContext = createContext('');

export const useModalBehavior = () => {
  return useContext(ModalBehaviorContext);
};
