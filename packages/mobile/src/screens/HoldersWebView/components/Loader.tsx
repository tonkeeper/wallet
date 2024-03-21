import React, { memo } from 'react';
import Animated, { FadeOut } from 'react-native-reanimated';
import { Steezy } from '@tonkeeper/uikit';

export const Loader = memo(() => {
  return (
    <Animated.View
      style={styles.webViewLoader.static}
      exiting={FadeOut.delay(200).duration(150)}
    />
  );
});

const styles = Steezy.create({
  webViewLoader: {
    backgroundColor: '#10161F',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
