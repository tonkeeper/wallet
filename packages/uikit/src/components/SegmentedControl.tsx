import { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { TouchableOpacity } from './TouchableOpacity';
import { memo, useCallback, useState } from 'react';
import { Steezy, useTheme } from '../styles';
import { Text } from './Text';
import { View } from './View';
import Animated, {
  withTiming,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface SegmentedControlProps {
  onChange?: (index: number) => void;
  items: string[];
  index?: number;
}

export const SegmentedControl = memo<SegmentedControlProps>((props) => {
  const { onChange, items, index } = props;
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

  const indicatorStyle = { backgroundColor: theme.buttonTertiaryBackground };

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

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.indicator.static, indicatorStyle, indicatorAnimatedStyle]}
      />
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
    position: 'absolute',
    top: 4,
    borderRadius: 20,
    height: 32,
    width: 20,
  },
}));
