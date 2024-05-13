import { Lottie, Steezy, View, deviceHeight, deviceWidth } from '@tonkeeper/uikit';
import { memo } from 'react';

const confettiWidth = deviceHeight * 0.5625;

export const NotcoinConfetti = memo(() => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Lottie name="confetti" style={styles.lottie.static} />
    </View>
  );
});

const styles = Steezy.create(() => ({
  container: {
    position: 'absolute',
    left: (deviceWidth - confettiWidth) / 2,
    bottom: 0,
    width: confettiWidth,
    height: deviceHeight,
  },
  lottie: {
    width: confettiWidth,
    height: deviceHeight,
  },
}));
