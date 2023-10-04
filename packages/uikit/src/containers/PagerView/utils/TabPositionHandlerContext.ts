import { createContext } from 'react';

type SetTabPositionFn = (index: number, position: number) => void;

export const TabPositionHandlerContext = createContext<SetTabPositionFn | null>(null);
