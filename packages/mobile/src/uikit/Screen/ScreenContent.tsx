import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { ReactNode, memo, useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ViewProps } from 'react-native';

interface ScreenContentProps extends ViewProps {
  part?: boolean;
}

export const ScreenContent = memo<ScreenContentProps>((props) => {
  const { style, part,  ...other } = props;
  const tabBarHeight = useBottomTabBarHeight();

  const containerStyle = useMemo(
    () => [
      { paddingBottom: tabBarHeight },
      !part && styles.flex,
      style
    ],
    [tabBarHeight, part],
  );

  return <View style={containerStyle} {...other} />;
});

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
});
