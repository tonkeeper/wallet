import { Steezy } from '$styles';
import { t } from '$translation';
import { Spacer, Text, View } from '$uikit';
import { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface RenewAllProgressButtonProps {
  current: number;
  total: number;
}

export const RenewAllProgressButton = memo<RenewAllProgressButtonProps>((props) => {
  const { current, total } = props;
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((current * width) / total, { duration: 100 });
  }, [current, total]);

  const handleLayout = useCallback((ev: LayoutChangeEvent) => {
    setWidth(ev.nativeEvent.layout.width);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value,
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.content}>
        <Text variant="label1">{t('renew_in_progress')}</Text>
        <Spacer x={8} />
        <Text variant="label1" color="textSecondary">
          {t('renew_progress_of', { current, count: total })}
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
