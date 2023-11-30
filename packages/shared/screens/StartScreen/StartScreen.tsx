import { Screen, View, Steezy, Text, Spacer, Button, Icon } from '@tonkeeper/uikit';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useLogoAnimation } from './animations/useLogoAnimation';
import { useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { memo } from 'react';

export const StartScreen = memo(() => {
  const { logoPosStyle, shapesOpacityStyle } = useLogoAnimation();
  const dimensions = useWindowDimensions();

  const origShapesWidth = 390;
  const origShapesHeight = 478;
  const ratio = dimensions.width / origShapesWidth;
  const shapesHeight = origShapesHeight * ratio;
  const shapesWidth = dimensions.width;

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={{ height: shapesHeight + 13 }}>
          <View style={styles.logo}>
            <Animated.View style={logoPosStyle}>
              <Icon
                style={styles.logoIcon.static}
                name="ic-logo-48"
                color="accentBlue"
                size={144}
              />
            </Animated.View>
          </View>
          <Animated.View style={[styles.absolute.static, shapesOpacityStyle]}>
            <LogoShapes width={shapesWidth} height={shapesHeight} />
          </Animated.View>
        </View>
        <View style={styles.info}>
          <Text type="h2" textAlign="center">
            Tonkeeper
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            Create a new wallet or add {'\n'}an existing one
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.buttons}>
          <Button title="Create New Wallet" navigate="/create" />
          <Spacer y={16} />
          <Button color="secondary" title="Import Existing Wallet" navigate="/import" />
        </View>
      </View>
    </Screen>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoIcon: {
    position: 'relative',
  },
  content: {
    paddingBottom: safeArea.bottom,
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24 + 3,
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

interface LogoShapesProps {
  width: number;
  height: number;
}

const LogoShapes = (props: LogoShapesProps) => (
  <Svg width={props.width} height={props.height} viewBox="0 0 390 478" fill="none">
    <Path fill="url(#a)" d="m195 412-600-270 600-270 600 270-600 270Z" opacity={0.12} />
    <Path
      fill="url(#b)"
      d="m615-172.998-420-189-420 189 419.997 650.996L615-172.998Z"
      opacity={0.12}
    />
    <Path
      fill="url(#c)"
      d="m-225-172.998 420-189 .003 839.996L-225-172.998Z"
      opacity={0.12}
    />
    <Path
      fill="#45AEF4"
      fillOpacity={0.01}
      stroke="#45AEF4"
      strokeWidth={0.5}
      d="M195 411.726-404.391 142 195-127.726 794.391 142 195 411.726Z"
      opacity={0.12}
    />
    <Path
      fill="#45AEF4"
      fillOpacity={0.01}
      stroke="#45AEF4"
      strokeWidth={0.5}
      d="M195-361.724 614.632-172.89 194.997 477.537-224.632-172.89 195-361.724Z"
      opacity={0.12}
    />
    <Path
      fill="#45AEF4"
      fillOpacity={0.01}
      stroke="#45AEF4"
      strokeWidth={0.5}
      d="M194.753 477.15 195-361.612-224.632-172.89l419.385 650.04Z"
      opacity={0.12}
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={195}
        x2={195}
        y1={-128}
        y2={412}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={195}
        x2={195}
        y1={-361.998}
        y2={477.998}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={-14.999}
        x2={-14.999}
        y1={-361.998}
        y2={477.998}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
    </Defs>
  </Svg>
);
