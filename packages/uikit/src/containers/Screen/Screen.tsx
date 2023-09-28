import { ScreenHeaderTypes, ScreenScrollContext, useScreenScrollHandler } from './hooks/useScreenScroll';
import React, { PropsWithChildren, isValidElement, memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenLargeHeader } from './ScreenLargeHeader';
import { ScreenHeader } from './ScreenHeader';

export const Screen = memo<PropsWithChildren>((props) => {
  const headerType = useMemo(() => {
    return React.Children.toArray(props.children).reduce<ScreenHeaderTypes>((type, child) => {
      if (isValidElement(child)) {
        if (child.type === ScreenLargeHeader) {
          type = 'large';
        } else if (child.type === ScreenHeader) {
          type = 'normal';
        }        
      }
      
      return type;
    }, 'none');
  }, [props.children]);

  const screenScroll = useScreenScrollHandler(headerType);

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
