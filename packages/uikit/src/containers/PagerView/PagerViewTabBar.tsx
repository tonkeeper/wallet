import { TabPositionHandlerContext } from './utils/TabPositionHandlerContext';
import { tabIndicatorWidth, usePagerView } from './hooks/usePagerView';
import { ScreenHeaderHeight } from '../Screen/utils/constants';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PagerViewTabBarHeight } from './constants';
import { useScreenScroll } from '../Screen/hooks';
import { useTheme } from '../../styles';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface PagerViewTabBarProps {
  children: React.ReactNode;
  centered?: boolean;
  style?: ViewStyle;
}

type TabIndicatorRange = {
  positions: number[];
  indexes: number[];
};

export const PagerViewTabBar = memo<PagerViewTabBarProps>((props) => {
  const { style, centered, children } = props;
  const [tabPositions, setTabPositions] = useState<{ [key in string]: number }>({});
  const { pageOffset, scrollY, headerHeight } = usePagerView();
  const { headerType } = useScreenScroll();
  const theme = useTheme();

  const setTabsPosition = useCallback(
    (index: number, position: number) => {
      setTabPositions((state) => ({ ...state, [`${index}`]: position }));
    },
    [setTabPositions],
  );

  const range = useMemo(() => {
    const range: TabIndicatorRange = { positions: [], indexes: [] };
    const indexes = Object.keys(tabPositions);
    return indexes.reduce((acc, index) => {
      acc.positions.push(tabPositions[index]);
      acc.indexes.push(Number(index));

      return acc;
    }, range);
  }, [tabPositions]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    if (range.indexes.length < 2 || range.positions.length < 2) {
      return { opacity: 0 };
    }

    return {
      opacity: withTiming(1),
      transform: [
        {
          translateX: interpolate(
            pageOffset.value,
            range.indexes,
            range.positions,
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [range.indexes, range.positions, pageOffset.value]);

  const containerShiftStyle = useAnimatedStyle(() => {
    'worklet';
    const headerOffset = headerType === 'large' ? ScreenHeaderHeight : 0;
    const isHeaderEndReached = scrollY.value > headerHeight - headerOffset;
    const translateY = isHeaderEndReached
      ? scrollY.value - (headerHeight - headerOffset)
      : 0;
    const borderBottomColor = isHeaderEndReached ? theme.separatorCommon : 'transparent';

    return {
      transform: [{ translateY }],
      borderBottomColor,
    };
  });

  const containerStyle = useMemo(
    () => [
      styles.container,
      containerShiftStyle,
      centered && styles.centered,
      { backgroundColor: theme.backgroundPage },
      style,
    ],
    [style, containerShiftStyle, theme.backgroundPage, centered],
  );

  const indicatorStyle = useMemo(
    () => [
      styles.indicator,
      indicatorAnimatedStyle,
      { backgroundColor: theme.accentBlue },
    ],
    [indicatorAnimatedStyle, theme.accentBlue],
  );

  return (
    <Animated.View pointerEvents="box-none" style={containerStyle}>
      <View style={styles.row} pointerEvents="box-none">
        <TabPositionHandlerContext.Provider value={setTabsPosition}>
          {children}
        </TabPositionHandlerContext.Provider>
        <Animated.View pointerEvents="box-none" style={indicatorStyle} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: PagerViewTabBarHeight,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 12,
  },
  indicator: {
    position: 'absolute',
    bottom: 16,
    width: tabIndicatorWidth,
    height: 3,
    borderRadius: 3,
  },
  centered: {
    alignItems: 'center',
  },
});
