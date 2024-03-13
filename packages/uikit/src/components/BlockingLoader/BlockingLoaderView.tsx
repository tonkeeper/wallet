import React, { FC, memo, useEffect, useRef, useSyncExternalStore } from 'react';
import { BackHandler } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlockingLoader } from './BlockingLoader';
import { View } from '../View';
import { Steezy } from '../../styles';
import Animated, {
  Easing,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { isIOS } from '../../utils';

export const BlockingLoaderView: FC = memo(() => {
  const isShown = useSyncExternalStore(
    BlockingLoader.subscribe.bind(BlockingLoader),
    BlockingLoader.getSnapshot.bind(BlockingLoader),
  );

  const lottieRef = useRef<LottieView>(null);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      position: 'absolute',
      opacity: withTiming(isShown ? 0.64 : 0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  }, [isShown]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isShown ? 1 : 0.5) }],
      opacity: withTiming(isShown ? 1 : 0, { duration: 200 }),
    };
  }, [isShown]);

  useEffect(() => {
    if (isShown) {
      lottieRef.current?.play(9, 50);
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isShown) {
        // Handle the back button press here
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    });

    return () => {
      lottieRef.current?.reset();
      subscription.remove();
    };
  }, [isShown]);

  const Container = isIOS ? FullWindowOverlay : View;

  return (
    <Container
      {...(!isIOS && {
        style: styles.androidContainer,
        pointerEvents: isShown ? 'auto' : 'none',
      })}
    >
      <View style={styles.container} pointerEvents={isShown ? 'auto' : 'none'}>
        <Animated.View style={animatedBackgroundStyle}>
          <View style={styles.background} />
        </Animated.View>
        <Animated.View style={animatedIconStyle}>
          <LottieView
            ref={lottieRef}
            source={require('../../../assets/lottie/gear.json')}
            style={styles.lottie.static}
            autoPlay={false}
            loop={true}
          />
        </Animated.View>
      </View>
    </Container>
  );
});

const styles = Steezy.create(({ colors }) => ({
  androidContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    backgroundColor: colors.backgroundPage,
  },
  lottie: {
    width: 69,
    height: 69,
  },
}));
