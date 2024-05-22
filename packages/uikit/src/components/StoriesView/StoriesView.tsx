import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { View } from '../View';
import { Icon } from '../Icon';
import { Steezy, useTheme } from '../../styles';
import { TouchableOpacity } from '../TouchableOpacity';
import Animated, {
  DerivedValue,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FastImage } from '../FastImage';
import { Text } from '../Text';
import { Spacer } from '../Spacer';
import { GestureDetector, Gesture, State } from 'react-native-gesture-handler';
import { Source } from 'react-native-fast-image';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { deviceHeight, deviceWidth, isAndroid } from '../../utils';
import { Modal } from '../../containers/Modal';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import {
  BottomSheetBackdropProps,
  SheetModalBackdrop,
} from '../../containers/Modal/SheetModal/SheetModalBackdrop';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { Loader } from '../Loader';

export interface StoriesItem {
  title: string;
  description: string;
  image?: number | Source;
  buttonTitle?: string;
  onPressButton?: () => void;
}

interface Props {
  items: StoriesItem[];
  onClose: () => void;
  onEnd?: () => void;
}

const STORY_DURATION = 10000;

const HEIGHT = isAndroid
  ? deviceHeight
  : deviceHeight -
    (initialWindowMetrics?.insets.top ?? 0) -
    (initialWindowMetrics?.insets.bottom ?? 0);

const StoriesViewContent: FC<
  Props & { setEnableContentPanningGesture: (value: boolean) => void }
> = (props) => {
  const { items, onClose, onEnd, setEnableContentPanningGesture } = props;

  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const timeline = useSharedValue(0);

  const lastIndex = items.length - 1;

  const indicatorsValues = useDerivedValue(() => {
    return items.map((_, index) => {
      if (index === currentIndex) {
        return timeline.value;
      }

      if (index < currentIndex) {
        return 1;
      }

      return 0;
    });
  }, [currentIndex, items]);

  const handleEnd = useCallback(() => {
    onEnd?.();
  }, [onEnd]);

  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const isOnPause = useSharedValue(false);

  const disableSheetGesture = useCallback(() => {
    timeoutId.current = setTimeout(() => {
      setEnableContentPanningGesture(false);
      isOnPause.value = true;
    }, 300);
  }, []);

  const enableSheetGesture = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }

    setEnableContentPanningGesture(true);
    isOnPause.value = false;
  }, []);

  const pauseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOnPause.value ? 0 : 1),
  }));

  const tapStart = useSharedValue(0);
  const isButtonPressed = useSharedValue(false);

  const nativeGesture = Gesture.Native()
    .onTouchesDown(() => {
      tapStart.value = Date.now();
      timeline.value = timeline.value;

      runOnJS(disableSheetGesture)();
    })
    .onTouchesCancelled(() => {
      runOnJS(enableSheetGesture)();
    })
    .onTouchesUp((e) => {
      if (e.numberOfTouches > 0) {
        return;
      }

      runOnJS(enableSheetGesture)();

      const isBack = e.allTouches[0].x < deviceWidth / 2;

      const isAbleToSwitch = isBack ? currentIndex > 0 : currentIndex < lastIndex;
      const isPause = Date.now() - tapStart.value > 300;

      if (isPause || !isAbleToSwitch || isButtonPressed.value) {
        if (!isPause && isBack && currentIndex === 0 && !isButtonPressed.value) {
          timeline.value = 0;
        }

        if (!isPause && !isBack && currentIndex === lastIndex && !isButtonPressed.value) {
          runOnJS(handleEnd)();
        }

        timeline.value = withTiming(
          1,
          { duration: STORY_DURATION * (1 - timeline.value), easing: Easing.linear },
          (finished) => {
            if (!finished) {
              return;
            }

            if (currentIndex !== lastIndex) {
              runOnJS(setCurrentIndex)(currentIndex + 1);
            } else {
              runOnJS(handleEnd)();
            }
          },
        );
      } else {
        runOnJS(setCurrentIndex)(isBack ? currentIndex - 1 : currentIndex + 1);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      isButtonPressed.value = true;
    })
    .onFinalize(() => {
      isButtonPressed.value = false;
    });

  useEffect(() => {
    timeline.value = 0;
    timeline.value = withTiming(
      1,
      { duration: STORY_DURATION, easing: Easing.linear },
      (finished) => {
        if (!finished) {
          return;
        }

        if (currentIndex !== lastIndex) {
          runOnJS(setCurrentIndex)(currentIndex + 1);
        } else {
          runOnJS(handleEnd)();
        }
      },
    );
  }, [currentIndex]);

  useEffect(() => {
    SystemNavigationBar.setNavigationColor(theme.constantBlack, 'light', 'navigation');

    return () => {
      SystemNavigationBar.setNavigationColor(
        theme.backgroundPageAlternate,
        theme.isDark ? 'light' : 'dark',
        'navigation',
      );
    };
  }, [theme.backgroundPageAlternate, theme.isDark]);

  const { animatedContentGestureState } = useBottomSheetInternal();

  useAnimatedReaction(
    () => animatedContentGestureState.value,
    (state, prev) => {
      if (state === State.END && prev !== State.END) {
        timeline.value = withTiming(
          1,
          { duration: STORY_DURATION * (1 - timeline.value), easing: Easing.linear },
          (finished) => {
            if (!finished) {
              return;
            }

            if (currentIndex !== lastIndex) {
              runOnJS(setCurrentIndex)(currentIndex + 1);
            } else {
              runOnJS(handleEnd)();
            }
          },
        );
      }
    },
  );

  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(items.length).fill(false),
  );

  const handleImageLoadEnd = useCallback((index: number) => {
    setImagesLoaded((prev) => prev.map((value, i) => (i === index ? true : value)));
  }, []);

  return (
    <GestureDetector gesture={nativeGesture}>
      <View style={styles.container}>
        {items.map((item, index) => (
          <FastImage
            key={index}
            style={[styles.storyContainer, index === currentIndex && styles.currentStory]}
            pointerEvents={index === currentIndex ? 'auto' : 'none'}
            source={
              typeof item.image === 'object' && index === currentIndex
                ? { ...item.image, priority: 'high' }
                : item.image
            }
            onLoadEnd={() => handleImageLoadEnd(index)}
          >
            <Text type="h1" color="constantWhite">
              {item.title}
            </Text>
            <Spacer y={8} />
            <Text color="constantWhite">{item.description}</Text>
            {item.buttonTitle ? (
              <GestureDetector gesture={tapGesture}>
                <TouchableOpacity style={styles.button} onPress={item.onPressButton}>
                  <Text type="label1" color="constantBlack">
                    {item.buttonTitle}
                  </Text>
                </TouchableOpacity>
              </GestureDetector>
            ) : null}
            {!item.image || imagesLoaded[index] ? null : (
              <View pointerEvents="none" style={styles.loaderContainer}>
                <Loader size="large" color="constantWhite" />
              </View>
            )}
          </FastImage>
        ))}
        <Animated.View style={[styles.indicators.static, pauseAnimatedStyle]}>
          {items.map((_, index) => (
            <Indicator key={index} index={index} indicatorsValues={indicatorsValues} />
          ))}
        </Animated.View>
        <Animated.View style={[styles.closeContainer.static, pauseAnimatedStyle]}>
          <GestureDetector gesture={tapGesture}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="ic-close-16" color="constantBlack" />
            </TouchableOpacity>
          </GestureDetector>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export const StoriesView: FC<Props> = (props) => {
  const [enableContentPanningGesture, setEnableContentPanningGesture] = useState(true);

  return (
    <Modal
      backgroundStyle={{ backgroundColor: 'transparent', borderRadius: 20 }}
      backdropComponent={BackdropSheetComponent}
      topInset={0}
      enableContentPanningGesture={enableContentPanningGesture}
    >
      <Modal.Content>
        <StatusBar barStyle="light-content" />
        <StoriesViewContent
          {...props}
          setEnableContentPanningGesture={setEnableContentPanningGesture}
        />
      </Modal.Content>
    </Modal>
  );
};

const Indicator: FC<{ index: number; indicatorsValues: DerivedValue<number[]> }> = (
  props,
) => {
  const { index, indicatorsValues } = props;

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: '#FFF',
    width: (indicatorsValues.value[index] * 100 + '%') as `${number}%`,
  }));

  return (
    <View style={styles.indicator}>
      <Animated.View key={index} style={animatedStyle} />
    </View>
  );
};

const BackdropSheetComponent = memo((props: BottomSheetBackdropProps) => (
  <SheetModalBackdrop
    {...props}
    key="backdrop"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={1}
  />
));

const styles = Steezy.create(({ colors, safeArea, corners }) => ({
  container: {
    height: HEIGHT,
    marginBottom: isAndroid ? 8 : safeArea.bottom,
    borderRadius: corners.large,
    backgroundColor: colors.constantBlack,
    position: 'relative',
    overflow: 'hidden',
  },
  closeContainer: {
    position: 'absolute',
    top: 36,
    right: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.constantWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicators: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    overflow: 'hidden',
  },
  storyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
    paddingVertical: 28,
    opacity: 0,
    justifyContent: 'flex-end',
  },
  currentStory: {
    opacity: 1,
  },
  button: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.constantWhite,
    height: 48,
    marginTop: 28,
    marginBottom: 4,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
