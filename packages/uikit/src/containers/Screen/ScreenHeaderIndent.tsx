import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeaderHeight } from './utils/constants';
import { View } from 'react-native';
import { useMemo } from 'react';

export const ScreenHeaderIndent = () => {
  const safeArea = useSafeAreaInsets();

  const style = useMemo(
    () => ({
      height: ScreenHeaderHeight + safeArea.top,
    }),
    [safeArea.top],
  );

  return <View style={style} />;
};
