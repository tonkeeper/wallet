import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { tabIndicatorWidth, usePagerView } from './hooks/usePagerView';
import { useSetTabPosition } from './hooks/useSetTabPosition';
import { PagerViewTabBarHeight } from './constants';
import { Text } from '../../components/Text';
import { memo, useCallback } from 'react';
import { useTheme } from '../../styles';

interface PagerViewTabBarItemProps {
  label: string;
  index: number;
}

export const PagerViewTabBarItem = memo<PagerViewTabBarItemProps>((props) => {
  const { label, index } = props;
  const setTabPosition = useSetTabPosition();
  const { setPage, pageOffset } = usePagerView();
  const handlePressTab = () => setPage(index);
  const theme = useTheme();

  const measureTabItem = useCallback(
    (event: LayoutChangeEvent) => {
      const layout = event.nativeEvent.layout;
      const position = layout.x + (layout.width / 2 - tabIndicatorWidth / 2);

      setTabPosition(index, position);
    },
    [index, setTabPosition],
  );

  const textStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(
        pageOffset.value,
        [index - 1, index, index + 1],
        [theme.textSecondary, theme.textPrimary, theme.textSecondary],
      ),
    }),
    [pageOffset.value, index],
  );

  return (
    <TouchableOpacity
      key={`pagerview-tab-${index}`}
      onLayout={measureTabItem}
      onPress={handlePressTab}
      activeOpacity={0.6}
    >
      <View style={styles.tabItem}>
        <Text reanimated type="label1" style={textStyle}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  tabItem: {
    height: PagerViewTabBarHeight - 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingTop: 4,
  },
});
