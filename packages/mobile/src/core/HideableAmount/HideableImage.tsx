import { StyleProp, ViewStyle, StyleSheet, ImageStyle } from 'react-native';
import React, { memo, ReactNode, useContext } from 'react';
import {
  HideableAmountContext,
  useHideableAmount,
} from '$core/HideableAmount/HideableAmountProvider';
import { useAnimatedStyle } from 'react-native-reanimated';
import { View } from '$uikit';
import Animated from 'react-native-reanimated';
import { Steezy } from '$styles';
import { BlurView } from 'expo-blur';
import FastImage from 'react-native-fast-image';

export interface HideableImageProps {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: ReactNode;
  image?: ReactNode;
}

const HideableImageComponent: React.FC<HideableImageProps> = ({
  uri,
  style,
  children,
  imageStyle,
  image,
}) => {
  const animationProgress = useHideableAmount();
  const blurContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
    };
  }, []);

  return (
    <View style={style}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.blur.static,
          imageStyle,
          blurContainerStyle,
        ]}
      >
        <BlurView style={[StyleSheet.absoluteFill]} intensity={70} />
      </Animated.View>
      {image ?? (
        <FastImage
          resizeMode="cover"
          source={{
            uri,
          }}
          style={[StyleSheet.absoluteFill, styles.image.static, imageStyle]}
        >
          {children}
        </FastImage>
      )}
    </View>
  );
};

export const HideableImage = memo(HideableImageComponent);

const styles = Steezy.create(({ colors, corners }) => ({
  blur: {
    zIndex: 3,
    overflow: 'hidden',
  },
  image: {
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
}));
