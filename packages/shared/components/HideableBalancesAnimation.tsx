import { SharedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { createContext, memo, PropsWithChildren, useContext } from 'react';
import { useTonkeeper } from '../hooks/useTonkeeper';

const HideableBalancesContext = createContext<SharedValue<number> | null>(null);

const ANIMATION_DURATION = 300;

export const HideableBalancesAnimationProvider = memo<PropsWithChildren>((props) => {
  const hiddenBalances = useTonkeeper((state) => state.hiddenBalances);
  const animation = useSharedValue(hiddenBalances ? 1 : 0);
  animation.value = withTiming(hiddenBalances ? 1 : 0, {
    duration: ANIMATION_DURATION,
  });

  return (
    <HideableBalancesContext.Provider value={animation}>
      {props.children}
    </HideableBalancesContext.Provider>
  );
});

export const useHideableBalancesAnimation = () => {
  const context = useContext(HideableBalancesContext);

  if (context === null) {
    throw new Error('Need wrap HideableBalancesContext');
  }

  return context;
};
