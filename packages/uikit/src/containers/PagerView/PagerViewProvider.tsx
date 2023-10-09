import { PagerViewContext, usePagerViewHandler } from './hooks/usePagerView';
import { ScreenBottomSeparator } from '../Screen/ScreenBottomSeparator';
import { SharedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { memo } from 'react';

interface PagerViewProviderProps {
  pageOffset?: SharedValue<number>;
  children?: React.ReactNode;
}

export const PagerViewProvider = memo<PagerViewProviderProps>((props) => {
  const { pageOffset } = props;
  const pager = usePagerViewHandler(pageOffset);

  return (
    <PagerViewContext.Provider value={pager}>
      <View style={styles.flex}>
        {props.children}
        <ScreenBottomSeparator />
      </View>
    </PagerViewContext.Provider>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
