import { createContext, ReactNode } from 'react';
import { SharedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';

// @ts-ignore
export const HideableAmountContext = createContext<SharedValue<number>>(null);

const ANIMATION_DURATION = 300;

export const HideableAmountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);
  const animationProgress = useSharedValue(isHidden ? 1 : 0);

  animationProgress.value = withTiming(isHidden ? 1 : 0, {
    duration: ANIMATION_DURATION,
  });

  return (
    <HideableAmountContext.Provider value={animationProgress}>
      {children}
    </HideableAmountContext.Provider>
  );
};
