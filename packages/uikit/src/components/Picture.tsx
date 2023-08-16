import FastImage, { FastImageProps } from 'react-native-fast-image';
import { StyleProp } from '@bogoslavskiy/react-native-steezy';
import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ImageStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { View } from './View';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

enum PictureState {
  Image = 0,
  Preview = 1,
}

export type PictureBehavior = 'preview' | 'image' | 'auto';

interface PictureProps extends Omit<FastImageProps, 'source' | 'style'> {
  style?: StyleProp<ImageStyle>;
  behavior?: PictureBehavior;
  preview?: string | null;
  uri?: string | null;
}

export const Picture = memo<PictureProps>((props) => {
  const {
    resizeMode = 'cover',
    behavior = 'auto',
    preview,
    style,
    uri,
    ...other
  } = props;
  const animation = useSharedValue(PictureState.Preview);
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoad = () => setIsLoaded(true);
  const previewSource = useMemo(() => ({ uri: preview ?? undefined }), [preview]);
  const source = useMemo(() => ({ uri: uri ?? undefined }), [uri]);
  const hasPreview = !!preview;

  useEffect(() => {
    let state = hasPreview && !isLoaded ? PictureState.Preview : PictureState.Image;
    if (behavior === 'image') {
      state = PictureState.Image;
    } else if (behavior === 'preview') {
      state = PictureState.Preview;
    }

    animation.value = withTiming(state, { duration: 100 });
  }, [isLoaded, behavior, hasPreview]);

  const imageAnimationStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animation.value,
      [PictureState.Image, PictureState.Preview],
      [1, 0],
    ),
  }));

  const previewAnimationStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animation.value,
      [PictureState.Image, PictureState.Preview],
      [0, 1],
    ),
  }));

  return (
    <View style={[style, styles.container]}>
      <Animated.View style={imageAnimationStyle}>
        <FastImage
          {...other}
          onLoad={handleLoad}
          source={source}
          resizeMode={resizeMode}
          style={styles.image}
        />
      </Animated.View>
      {hasPreview && (
        <Animated.View style={[styles.imagePreview, previewAnimationStyle]}>
          <FastImage
            {...other}
            source={previewSource}
            resizeMode={resizeMode}
            style={styles.image}
          />
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
});
