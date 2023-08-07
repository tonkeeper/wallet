import { View, StyleSheet, ViewProps } from 'react-native';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { memo, useMemo } from 'react';

interface ScreenContentProps extends ViewProps {
  flex?: boolean;
}

export const ScreenContent = memo<ScreenContentProps>((props) => {
  const { style, flex = true, ...other } = props;
  const tabBarHeight = useBottomTabBarHeight();

  const containerStyle = useMemo(
    () => [{ paddingBottom: tabBarHeight }, flex && styles.flex, style],
    [tabBarHeight, flex, style],
  );

  return <View style={containerStyle} {...other} />;
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
