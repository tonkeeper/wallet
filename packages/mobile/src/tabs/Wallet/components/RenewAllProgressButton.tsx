import { Steezy } from '$styles';
import { t } from '$translation';
import { Spacer, Text, View } from '$uikit';
import { delay } from '$utils';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface RenewAllProgressButtonProps {
  current: number;
  total: number;
}

export const RenewAllProgressButton = memo<RenewAllProgressButtonProps>((props) => {
  const { total } = props;
  const [count, setCount] = useState(1);
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    (async () => {
      for (let i = 0; i < total; i++) {
        progress.value = withTiming(i + 1, { duration: 3750 }, () =>
          runOnJS(setCount)(i + 2),
        );
        await delay(3750);
      }
    })();
  }, []);

  const handleLayout = useCallback((ev: LayoutChangeEvent) => {
    setWidth(ev.nativeEvent.layout.width);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, total], [0, width]),
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.content}>
        <Text variant="label1">{t('renew_in_progress')}</Text>
        <Spacer x={8} />
        <Text variant="label1" color="textSecondary">
          {t('renew_progress_of', { current: Math.min(count, total), count: total })}
        </Text>
      </View>
      <Animated.View style={[styles.progress.static, progressStyle]} />
    </View>
  );
});

const styles = Steezy.create(({ corners, colors }) => ({
  container: {
    height: 56,
    borderRadius: corners.medium,
    backgroundColor: colors.buttonSecondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    position: 'absolute',
    height: 56,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(194, 218, 255, 0.08)',
  },
}));
