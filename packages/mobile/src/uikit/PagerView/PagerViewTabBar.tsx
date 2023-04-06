import Animated, { Extrapolate, interpolate, interpolateColor, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { tabIndicatorWidth, usePagerView } from './hooks/usePagerView';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTheme } from '$hooks';
import { Text } from '$uikit';

type TabItem = {
  label: string;
};

interface TabsBarProps {
  style?: ViewStyle;
  indent?: boolean;
  center?: boolean;
  tabs: TabItem[];
}

export const PagerViewTabBar = memo<TabsBarProps>((props) => {
  const { center, style, tabs } = props;
  const [tabsPositions, setTabsPositions] = useState<{ [key: string]: number }>({});
  const { pageOffset, scrollY, headerHeight, setPage } = usePagerView();
  const theme = useTheme();

  const handlePressTab = (index: number) => () => setPage(index);

  const measureTabItem = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const layout = event.nativeEvent.layout;
      const position = layout.x + (layout.width / 2 - tabIndicatorWidth / 2);
      setTabsPositions((state) => ({ ...state, [`${index}`]: position }));
    },
    [setTabsPositions],
  );

  const tabsIndexes = useMemo(() => {
    return (tabs ?? []).map((_, index) => index);
  }, [tabs]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const outputRange = Object.values(tabsPositions);

    if (outputRange.length !== tabsIndexes.length) {
      return { opacity: 0 };
    }

    return {
      opacity: withTiming(1),
      transform: [
        {
          translateX: interpolate(
            pageOffset.value,
            tabsIndexes,
            outputRange,
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [tabsPositions, tabsIndexes, pageOffset.value]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const isHeaderEndReached = scrollY.value > headerHeight.value;
    const translateY = isHeaderEndReached ? scrollY.value - headerHeight.value : 0;
    const borderBottomColor = isHeaderEndReached ? theme.colors.border : 'transparent';

    return {
      transform: [{ translateY }],
      borderBottomColor,
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        center && styles.center,
        containerAnimatedStyle,
        style,
        { backgroundColor: theme.colors.backgroundPrimary },
      ]}
    >
      <Animated.View style={styles.row} pointerEvents="box-none">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            onLayout={measureTabItem(index)}
            onPress={handlePressTab(index)}
            key={`pagerview-tab-${index}`}
            activeOpacity={0.6}
          >
            <View style={styles.tabItem}>
              <TabLabel label={tab.label} index={index} />
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.indicator,
            indicatorAnimatedStyle,
            { backgroundColor: theme.colors.accentPrimary },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
});

interface TabLabelProps {
  index: number;
  label: string;
}

const TabLabel = memo<TabLabelProps>((props) => {
  const { index, label } = props;
  const { pageOffset } = usePagerView();
  const theme = useTheme();

  const textStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(
        pageOffset.value,
        [index - 1, index, index + 1],
        [
          theme.colors.textSecondary,
          theme.colors.textPrimary,
          theme.colors.textSecondary,
        ],
      ),
    }),
    [pageOffset.value],
  );

  return (
    <Text reanimated variant="label1" style={textStyle}>
      {label}
    </Text>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 16,
    width: tabIndicatorWidth,
    height: 3,
    borderRadius: 3,
  },
  tabItem: {
    paddingTop: 4,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
});
