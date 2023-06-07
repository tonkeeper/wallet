import { ScreenScrollContext, useScreenScrollHandler } from './hooks/useScreenScroll';
import { View, StyleSheet } from 'react-native';
import { PropsWithChildren, memo } from 'react';

export const Screen = memo<PropsWithChildren>((props) => {
  const screenScroll = useScreenScrollHandler();

  return (
    <ScreenScrollContext.Provider value={screenScroll}>
      <View style={styles.container}>{props.children}</View>
    </ScreenScrollContext.Provider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
