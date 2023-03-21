import React, { createContext, memo, useContext } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScreenScrollHandler } from './useScreenScrollHandler';

export interface IScreenScrollContext {
  scrollY: Animated.SharedValue<number>;
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollRef: React.RefObject<any>;
  isEndReached: Animated.SharedValue<number>;
  detectContentSize: (w: number, h: number) => void; 
  detectLayoutSize: (ev: LayoutChangeEvent) => void; 
}

const defaultValue: IScreenScrollContext = {
  detectContentSize: () => {},
  detectLayoutSize: () => {},
  scrollHandler: () => {},
  scrollRef: { current: null },
  isEndReached: { value: 0 },
  scrollY: { value: 0 },
};

export const ScreenScrollContext = createContext<IScreenScrollContext>(defaultValue);

export const ScreenScrollProvider = memo((props) => {
  const screenScroll = useScreenScrollHandler();

  return (
    <ScreenScrollContext.Provider value={screenScroll}>
      {props.children}
    </ScreenScrollContext.Provider>
  );
});


// See useScreenScrollHandler
export const useScreenScroll = () => {
  return useContext(ScreenScrollContext);
};
