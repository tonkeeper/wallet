import React, { createContext, ReactNode, useContext } from 'react';
import { SharedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';

export const HideableAmountContext = createContext<SharedValue<number> | null>(null);

const ANIMATION_DURATION = 300;

export const HideableAmountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);
  const animation = usePrivacyStore((state) => state.animation);
  const animationProgress = useSharedValue(isHidden ? 1 : 0);

  animationProgress.value = withTiming(isHidden ? 1 : 0, {
    duration: animation ? ANIMATION_DURATION : 0,
  });

  return (
    <HideableAmountContext.Provider value={animationProgress}>
      {children}
    </HideableAmountContext.Provider>
  );
};

export const useHideableAmount = () => {
  const context = useContext(HideableAmountContext);

  if (context === null) {
    throw new Error('Need wrap HideableAmountContext');
  }

  return context;
};
