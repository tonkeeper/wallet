import { memo, useMemo } from 'react';
import { Steezy, StyleProp } from '../styles';
import { Icon } from './Icon';
import { View } from './View';
import { ViewStyle } from 'react-native';
import { TonIconSizes, iconContainerSizes } from './TonIcon';
import { FastImage } from './FastImage';

export interface JettonIconProps {
  uri: string;
  size?: TonIconSizes;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const JettonIcon = memo<JettonIconProps>((props) => {
  const { uri, size = 'small', transparent, style } = props;

  const containerSize = iconContainerSizes[size];

  const sizeStyle = useMemo(
    () => ({
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    }),
    [containerSize],
  );

  const containerStyle = useMemo(
    () => [
      styles.container,
      transparent && styles.backgroundTransparent,
      sizeStyle,
      style,
    ],
    [transparent, sizeStyle, style],
  );

  return (
    <View style={containerStyle}>
      <FastImage source={{ uri }} style={sizeStyle} />
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: '#0098EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundTransparent: {
    backgroundColor: colors.backgroundContentTint,
  },
}));
