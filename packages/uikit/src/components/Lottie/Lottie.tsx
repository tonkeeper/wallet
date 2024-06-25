import { LottieList, LottieNames } from './LottieList.native';
import { memo, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { StyleProp, View, ViewStyle } from 'react-native';

interface LottieProps {
  autoSize?: boolean;
  autoPlay?: boolean;
  startDelay?: number;
  name: LottieNames;
  size?: number;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Lottie = memo<LottieProps>((props) => {
  const {
    autoPlay = false,
    autoSize = false,
    loop = false,
    startDelay = 400,
    size,
    name,
    style,
  } = props;
  const iconRef = useRef<LottieView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, startDelay);

    return () => clearTimeout(timer);
  }, []);

  const lottieSizeStyle = size ? { width: size, height: size } : undefined;

  const lottie = LottieList[name];

  if (lottie) {
    return (
      <LottieView
        style={[lottieSizeStyle, style]}
        autoSize={autoSize}
        autoPlay={autoPlay}
        source={lottie}
        ref={iconRef}
        loop={loop}
      />
    );
  } else {
    console.warn(`Lottie ${name} does not exist`);
    return <View style={[lottieSizeStyle, { backgroundColor: 'red' }]} />;
  }
});
