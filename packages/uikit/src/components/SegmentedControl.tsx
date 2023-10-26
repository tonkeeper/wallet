import { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { TouchableOpacity } from './TouchableOpacity';
import { memo, useCallback, useState } from 'react';
import { Steezy, StyleProp, useTheme } from '../styles';
import { Text } from './Text';
import { View } from './View';
import Animated, {
  withTiming,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { StaticStyles } from '@bogoslavskiy/react-native-steezy/dist/types';

interface SegmentedControlProps {
  onChange?: (index: number) => void;
  items: string[];
  index?: number;
  style?: StyleProp<StaticStyles>;
  indicatorStyle?: StyleProp<StaticStyles>;
}

export const SegmentedControl = memo<SegmentedControlProps>((props) => {
  const { onChange, items, index, style, indicatorStyle } = props;
  const theme = useTheme();

  const handleItemPress = (index: number) => () => onChange?.(index);

  const [tabsLayouts, setTabsLayouts] = useState<{ [key: string]: LayoutRectangle }>({});
  const handleLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const layout = event?.nativeEvent?.layout;

      if (layout) {
        setTabsLayouts((s) => ({ ...s, [`item-${index}`]: layout }));
      }
    },
    [],
  );

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const layout = tabsLayouts[`item-${index}`];

    if (!layout) {
      return {
        opacity: 0,
      };
    }

    const x = layout.x + (layout.width / 2 - layout.width / 2);

    return {
      width: withSpring(layout.width, {
        damping: 15,
        mass: 0.09,
      }),
      height: layout.height,
      transform: [
        {
          translateX: withSpring(x, {
            damping: 15,
            mass: 0.09,
          }),
        },
      ],
      opacity: withTiming(1),
    };
  }, [tabsLayouts, index]);

  const indicatorStyles = Steezy.useStyle([styles.indicator, indicatorStyle]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[indicatorStyles, indicatorAnimatedStyle]} />
      {items.map((item, index) => (
        <TouchableOpacity
          onPress={handleItemPress(index)}
          onLayout={handleLayout(index)}
          style={styles.item}
          key={index}
        >
          <Text type="label2">{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    backgroundColor: colors.backgroundContent,
    padding: 4,
    borderRadius: corners.large,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  indicator: {
    backgroundColor: colors.buttonTertiaryBackground,
    position: 'absolute',
    top: 4,
    borderRadius: 20,
  },
}));
