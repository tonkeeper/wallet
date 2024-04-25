import React, { useContext, useMemo } from 'react';
import { typedMemo } from '../utils';

type CellContextValue = {
  isActive: boolean;
  isActiveDragging: boolean;
};

const CellContext = React.createContext<CellContextValue | undefined>(undefined);

type Props = {
  isActive: boolean;
  isActiveDragging: boolean;
  children: React.ReactNode;
};

export function CellProvider({ isActive, isActiveDragging, children }: Props) {
  const value = useMemo(
    () => ({
      isActive,
      isActiveDragging,
    }),
    [isActive, isActiveDragging],
  );
  return <CellContext.Provider value={value}>{children}</CellContext.Provider>;
}

export default typedMemo(CellProvider);

export function useIsActive() {
  const value = useContext(CellContext);
  if (!value) {
    throw new Error('useIsActive must be called from within CellProvider!');
  }
  return value.isActive;
}
