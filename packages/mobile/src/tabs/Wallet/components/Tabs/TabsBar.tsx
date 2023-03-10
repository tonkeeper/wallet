import React, { memo, useCallback, useMemo, useState } from 'react';
import { Steezy } from '$styles';
import { Text, TouchableOpacity, View } from '$uikit';
import Animated, { Extrapolate, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '$hooks';
import { ns } from '$utils';
import { LayoutChangeEvent, LayoutRectangle, StyleSheet } from 'react-native';
import { useTabCtx } from './TabsContainer';

type TabItem = {
  label: string;
  value: string;
}; 

interface TabsBarProps {
  items: TabItem[];
  onChange: (item: TabItem, index: number) => void;
  value: string;
  indent?: boolean;
  center?: boolean;
  sticky?: any;
  children?: React.ReactNode;
}

const INDICATOR_WIDTH = ns(24);

export const TabsBarComponent = (props: TabsBarProps) => {
  const { value, indent = true, center } = props;
  const { setActiveIndex, pageOffset, scrollY, headerHeight } = useTabCtx();
  const theme = useTheme();

  const [tabsLayouts, setTabsBarLayouts] = useState<{ [key: string]: LayoutRectangle }>({});

  const handleLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const layout = event?.nativeEvent?.layout;

    if (layout) {
      setTabsBarLayouts((s) => ({ ...s, [`${index}`]: layout }));
    }
  }, []);

  const indicatorRange = useMemo(() => {
    return Object.values(tabsLayouts).map((item) => {
      return item.x + (item.width / 2 - INDICATOR_WIDTH / 2);
    });
  }, [tabsLayouts]);

  const input = props.items.map((_, index) => index);
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    if (indicatorRange.length !== props.items.length) {
      return {
        opacity: 0,
      };
    }

    const x = interpolate(
      pageOffset.value, 
      input,
      indicatorRange,
      Extrapolate.CLAMP
    );

    return {
      transform: [
        {
          translateX: x
        },
      ],
      opacity: withTiming(1),
    };
  }, [indicatorRange, value, pageOffset.value, input]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: scrollY.value > headerHeight.value ? scrollY.value - headerHeight.value : 0
      }]
    }
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor:
        scrollY && scrollY.value > headerHeight.value ? theme.colors.border : 'transparent',
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        containerStyle,
        indent && styles.indent, 
        styles.center,
        styles.wrap, borderStyle,
        { backgroundColor: theme.colors.backgroundPrimary },
      ]}
    >
      <Animated.View style={[styles.container]} pointerEvents="box-none">
        {props.items.map((item, index) => (
          <TouchableOpacity
            onLayout={(event) => handleLayout(index, event)}
            onPress={() => {
              props.onChange(item, index);
              setActiveIndex(index);
              // scrollToIndex(index);
            }}
            key={`tab-${index}`}
            activeOpacity={0.6}
          >
            <View style={styles.item}>
              <WrapText index={index} pageOffset={pageOffset}>
                {item.label}
              </WrapText>
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.indicator,
            indicatorAnimatedStyle,
            { backgroundColor: theme.colors.accentPrimary }
          ]} 
        />
      </Animated.View>
    </Animated.View>
  );
};

const WrapText = ({ 
  pageOffset,
  index,
  children
}: { index: number, pageOffset: any; children?: React.ReactNode }) => {
  const theme = useTheme();

  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        pageOffset.value,
        [index - 1, index, index + 1],
        [
          theme.colors.textSecondary, 
          theme.colors.textPrimary, 
          theme.colors.textSecondary
        ],
      )
    }
  }, [pageOffset.value]);

  return (
    <Text
      style={textStyle}
      variant="label1"
      reanimated
    >
      {children}
    </Text>
  )
}

export const TabsBar = memo(TabsBarComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    zIndex: 3,
  },
  wrap: {
    borderBottomWidth: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    paddingTop: 4,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  indicator: {
    position: 'absolute',
    bottom: 16,
    width: INDICATOR_WIDTH,
    height: 3,
    borderRadius: 3,
  },
  indent: {
    paddingHorizontal: 16,
    // marginBottom: 16
  },
});