import React, { memo, useCallback, useState } from 'react';
import { Steezy } from '$styles';
import { Text, TouchableOpacity, View } from '$uikit';
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '$hooks';
import { ns } from '$utils';
import { LayoutChangeEvent, LayoutRectangle } from 'react-native';
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
  const { activeIndex, setActiveIndex, scrollToIndex, pageOffset, localActive } = useTabCtx();
  const theme = useTheme();

  const [tabsLayouts, setTabsBarLayouts] = useState<{ [key: string]: LayoutRectangle }>({});

  const handleLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const layout = event?.nativeEvent?.layout;

    if (layout) {
      setTabsBarLayouts((s) => ({ ...s, [`${index}`]: layout }));
    }
  }, []);
  
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const output = Object.values(tabsLayouts).map((item) => {
      return item.x + (item.width / 2 - INDICATOR_WIDTH / 2);
    });

    if (output.length !== 2) {
      return {
        opacity: 0,
      };
    }

    return {
      transform: [
        {
          translateX: interpolate(
            pageOffset.value, 
            [0, 1],
            output,
            Extrapolate.CLAMP
          )
        },
      ],
      opacity: withTiming(1),
    };
  }, [tabsLayouts, value, pageOffset.value]);

  return (
    <View style={[indent && styles.indent, styles.center, center && styles.center]}>
      <View style={styles.container}>
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
              <Text
                variant="label1"
                color={
                  localActive === index
                    ? 'textPrimary'
                    : 'textSecondary'
                  }
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          pointerEvents="none" 
          style={[
            styles.indicator.static,
            indicatorAnimatedStyle,
            { backgroundColor: theme.colors.accentPrimary }
          ]} 
        />
      </View>
    </View>
  );
};

export const TabsBar = memo(TabsBarComponent);

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
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
    marginHorizontal: 16,
    marginBottom: 16
  },
}));