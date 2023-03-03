import React, { memo, useCallback, useState } from 'react';
import { Steezy } from '$styles';
import { Text, TouchableOpacity, View } from '$uikit';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '$hooks';
import { ns } from '$utils';
import { LayoutChangeEvent, LayoutRectangle } from 'react-native';

type TabItem = {
  label: string;
  value: string;
}; 

interface TabsProps {
  items: TabItem[];
  onChange: (item: TabItem, index: number) => void;
  value: string;
  indent?: boolean;
  center?: boolean;
}

const INDICATOR_WIDTH = ns(24);

export const TabsComponent = (props: TabsProps) => {
  const { value, indent = true, center } = props;
  const theme = useTheme();

  const [tabsLayouts, setTabsLayouts] = useState<{ [key: string]: LayoutRectangle }>({});

  const handleLayout = useCallback((tab: string, event: LayoutChangeEvent) => {
    const layout = event?.nativeEvent?.layout;

    if (layout) {
      setTabsLayouts((s) => ({ ...s, [tab]: layout }));
    }
  }, []);
  
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const layout = tabsLayouts[value];

    if (!layout) {
      return {
        opacity: 0,
      };
    }

    const x = layout.x + (layout.width / 2 - INDICATOR_WIDTH / 2);

    return {
      transform: [
        {
          translateX: withSpring(x, {
            damping: 15,
            mass: 0.1,
          }),
        },
      ],
      opacity: withTiming(1),
    };
  }, [tabsLayouts, value]);

  return (
    <View style={[indent && styles.indent, styles.center, center && styles.center]}>
      <View style={styles.container}>
        {props.items.map((item, index) => (
          <TouchableOpacity
            onLayout={(event) => handleLayout(item.value, event)}
            onPress={() => props.onChange(item, index)}
            key={`tab-${index}`}
            activeOpacity={0.6}
          >
            <View style={styles.item}>
              <Text
                variant="label1"
                color={
                  value === item.value 
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

export const Tabs = memo(TabsComponent);

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