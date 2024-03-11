import React, { memo, useCallback, useMemo, useState } from 'react';
import { Steezy } from '$styles';
import { Text, TouchableOpacity, View } from '$uikit';
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '$hooks/useTheme';
import { ns } from '$utils';
import { LayoutChangeEvent, LayoutRectangle, StyleProp, ViewStyle } from 'react-native';
import { useTabCtx } from './TabsContainer';

type TabItem = {
  label: string;
  value: string;
  withDot?: boolean;
};

interface TabsBarProps {
  items: TabItem[];
  onChange: (item: TabItem, index: number) => void;
  itemStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
  indent?: boolean;
  sticky?: any;
  scrollY?: Animated.SharedValue<number>;
  children?: React.ReactNode;
}

const INDICATOR_WIDTH = ns(24);

export const TabsBarComponent = (props: TabsBarProps) => {
  const { value, indent = true } = props;
  const { setActiveIndex, pageOffset, scrollY, headerHeight, isScrollInMomentum } =
    useTabCtx();
  const theme = useTheme();

  const [tabsLayouts, setTabsBarLayouts] = useState<{ [key: string]: LayoutRectangle }>(
    {},
  );

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

    const x = interpolate(pageOffset.value, input, indicatorRange, Extrapolate.CLAMP);

    return {
      transform: [
        {
          translateX: x,
        },
      ],
      opacity: withTiming(1),
    };
  }, [indicatorRange, value, pageOffset.value, input]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY:
            scrollY.value > headerHeight.value ? scrollY.value - headerHeight.value : 0,
        },
      ],
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor:
        (scrollY && scrollY.value > headerHeight.value) ||
        (props.scrollY && props.scrollY.value > headerHeight.value)
          ? theme.colors.border
          : 'transparent',
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        containerStyle,
        indent && styles.indent.static,
        styles.center.static,
        styles.wrap.static,
        borderStyle,
        { backgroundColor: theme.colors.backgroundPrimary },
        props.containerStyle,
      ]}
    >
      <Animated.View style={[styles.container.static]} pointerEvents="box-none">
        {props.items.map((item, index) => (
          <TouchableOpacity
            onLayout={(event) => handleLayout(index, event)}
            onPress={() => {
              if (!isScrollInMomentum.value) {
                props.onChange(item, index);
                setActiveIndex(index);
              }
            }}
            key={`tab-${index}`}
            activeOpacity={0.6}
          >
            <View style={[styles.item, props.itemStyle]}>
              <WrapText index={index} pageOffset={pageOffset}>
                {item.label}
              </WrapText>
              {item.withDot && (
                <View style={styles.itemDotContainer}>
                  <View style={styles.itemDot} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.indicator.static,
            indicatorAnimatedStyle,
            { backgroundColor: theme.colors.accentPrimary },
            props.indicatorStyle,
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const WrapText = ({
  pageOffset,
  index,
  children,
}: {
  index: number;
  pageOffset: any;
  children?: React.ReactNode;
}) => {
  const theme = useTheme();

  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        pageOffset.value,
        [index - 1, index, index + 1],
        [
          theme.colors.textSecondary,
          theme.colors.textPrimary,
          theme.colors.textSecondary,
        ],
      ),
    };
  }, [pageOffset.value]);

  return (
    <Text style={textStyle} variant="label1" reanimated>
      {children}
    </Text>
  );
};

export const TabsBar = memo(TabsBarComponent);

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    zIndex: 3,
  },
  wrap: {
    borderBottomWidth: ns(0.5),
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
  },
  itemDotContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    top: 10,
    bottom: 0,
    right: 2,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentRed,
  },
}));
