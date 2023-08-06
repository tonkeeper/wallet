import { Screen, View, Steezy, Text, Spacer, Button, Icon } from '@tonkeeper/uikit';
import { Pressable, ViewStyle, useWindowDimensions } from 'react-native';
import { useRingAnimation } from './animations/useRingAnimation';
import { useLogoAnimation } from './animations/useLogoAnimation';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { memo, useMemo } from 'react';
import { tonkeeper } from '../../tonkeeper';

export const StartScreen = memo(() => {
  const { start, logoRotateStyle, logoPosStyle } = useLogoAnimation();

  return (
    <Screen>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Ring delay={0} size={640} color="rgba(69, 174, 245, 0.04)" />
        <Ring delay={100} size={432} color="rgba(69, 174, 245, 0.08)" />
        <Ring delay={200} size={256} color="rgba(69, 174, 245, 0.12)" />

        <LinearGradient style={styles.bottomGradient.static} {...bottomGradientConfig} />
        <View style={styles.logo}>
          <Pressable onPress={start}>
            <Animated.View style={[logoRotateStyle, logoPosStyle]}>
              <Icon name="ic-logo-48" size={144} color="accentBlue" />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          <Text type="h2" textAlign="center">
            Tonkeeper
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            Create a new wallet or add an existing one
          </Text>
        </View>
        <View style={styles.buttons}>
          <Button
            title="Create new wallet"
            onPress={async () => {
              console.log('start await ');

              const privateKey = await tonkeeper.wallet.getPrivateKey();

              console.log('!end', privateKey);
            }}
          />
          <Spacer y={16} />
          <Button color="secondary" title="Import existing wallet" navigate="/import" />
        </View>
      </View>
    </Screen>
  );
});

interface RingProps {
  size: number;
  color: string;
  delay: number;
}

const RingBottomIndent = 80;

const Ring = ({ size, color, delay }: RingProps) => {
  const { ringStyle } = useRingAnimation(delay);
  const dimensions = useWindowDimensions();

  const ringStaticStyle: ViewStyle = useMemo(
    () => ({
      position: 'absolute',
      bottom: -(size / 2) + RingBottomIndent,
      left: dimensions.width / 2 - size / 2,
      width: size,
      height: size,
      borderWidth: 1,
      borderRadius: size / 2,
      borderColor: color,
      backgroundColor: color,
    }),
    [color, size],
  );

  return <Animated.View style={[ringStaticStyle, ringStyle]} />;
};

const styles = Steezy.create(({ safeArea }) => ({
  content: {
    paddingBottom: safeArea.bottom,
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    height: 224,
    width: '100%',
    zIndex: 1,
  },
}));

const bottomGradientConfig = {
  colors: [
    '#10161F',
    'rgba(16,22,31,0.99)',
    'rgba(16,22,31,0.96)',
    'rgba(16,22,31,0.92)',
    'rgba(16,22,31,0.85)',
    'rgba(16,22,31,0.77)',
    'rgba(16,22,31,0.67)',
    'rgba(16,22,31,0.56)',
    'rgba(16,22,31,0.44)',
    'rgba(16,22,31,0.33)',
    'rgba(16,22,31,0.23)',
    'rgba(16,22,31,0.15)',
    'rgba(16,22,31,0.08)',
    'rgba(16,22,31,0.04)',
    'rgba(16,22,31,0.01)',
    'rgba(16,22,31,0.00)',
  ],
  end: {
    x: 0.4999999999999999,
    y: 0,
  },
  locations: [
    0, 0.0667, 0.1333, 0.2, 0.2667, 0.3333, 0.4, 0.4667, 0.5333, 0.6, 0.6667000000000001,
    0.7333, 0.8, 0.8667, 0.9333, 1,
  ],
  start: {
    x: 0.5000000000000001,
    y: 1,
  },
};
