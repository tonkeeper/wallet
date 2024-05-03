import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { useTheme } from '$hooks/useTheme';
import { Loader } from '../../Loader/Loader';
import { Text } from '../../Text/Text';
import { deviceWidth, ns } from '$utils';
import { Toast, useToastStore } from '$store';

export enum ToastAnimationState {
  SHOWING = 'SHOWING',
  SHOWN = 'SHOWN',
  HIDING = 'HIDING',
  HIDDEN = 'HIDDEN',
}

export const ToastComponent = memo(() => {
  const state = useSharedValue(ToastAnimationState.HIDDEN);
  const safeArea = useSafeAreaInsets();
  const translate = useSharedValue(0);
  const theme = useTheme();

  const toast = useToastStore(({ currentToast }) => currentToast);

  const animatedHide = useCallback(() => {
    if (state.value !== ToastAnimationState.HIDDEN) {
      state.value = ToastAnimationState.HIDING;
      cancelAnimation(translate);

      const clearToast = () => Toast.clear();
      translate.value = withTiming(0, { duration: 200 }, (isFinished) => {
        if (isFinished) {
          runOnJS(clearToast)();
          state.value = ToastAnimationState.HIDDEN;
        }
      });
    }
  }, [state, translate]);

  React.useEffect(() => {
    const disposerHide = useToastStore.subscribe(
      (s) => s.shouldHide,
      (value, prevValue) => {
        if (value && value !== prevValue) {
          animatedHide();
        }
      },
    );

    const disposerShow = useToastStore.subscribe(
      (s) => !!s.currentToast,
      (value, prevValue) => {
        if (value && value !== prevValue) {
          if (state.value !== ToastAnimationState.SHOWN) {
            state.value = ToastAnimationState.SHOWING;
            cancelAnimation(translate);

            translate.value = withTiming(1, { duration: 200 }, (isFinished) => {
              if (isFinished) {
                state.value = ToastAnimationState.SHOWN;
              }
            });
          }
        }
      },
    );

    return () => {
      disposerShow();
      disposerHide();
    };
  }, []);

  const indentStyle = { top: safeArea.top };
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(translate.value, [0, 1], [-75, 0]),
      },
    ],
  }));

  if (!toast) {
    return null;
  }

  return (
    <FullWindowOverlay style={styles.overlay}>
      <Pressable style={[styles.container, indentStyle]} onPress={animatedHide}>
        <Animated.View
          style={[
            styles.toast,
            animatedStyle,
            toast.size === 'small' && styles.toastSmall,
            {
              backgroundColor: toast.warning
                ? theme.colors.accentOrange
                : theme.colors.backgroundContentTint,
            },
          ]}
        >
          {toast.isLoading && (
            <View style={styles.loaderContainer}>
              <Loader color="foregroundPrimary" size="small" />
            </View>
          )}

          <Text variant="label2">{toast.message}</Text>
        </Animated.View>
      </Pressable>
    </FullWindowOverlay>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: ns(5),
  },
  toast: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: ns(24),
    paddingHorizontal: ns(24),
    paddingTop: ns(13.5),
    paddingBottom: ns(14.5),

    maxWidth: deviceWidth - ns(16) * 2,

    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOpacity: 1,
  },
  toastSmall: {
    borderRadius: ns(14),
    paddingHorizontal: ns(16),
    paddingTop: ns(12),
    paddingBottom: ns(12),
    maxWidth: deviceWidth - ns(32) * 2,
  },
  loaderContainer: {
    marginRight: 8,
    marginLeft: -8,
  },
});
