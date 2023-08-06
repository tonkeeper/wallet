import React from 'react';
import { View, Image, ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { TonThemeColor } from '$styled';
import { IconSizes, IconNames } from './generated.types';
import { MobileIconsList } from './IconsMobileList';
import { useTheme } from '$hooks/useTheme';
import { ns } from '$utils';

export interface IconProps {
  name: IconNames;
  style?: ViewStyle;
  imageStyle?: StyleProp<ImageStyle>;
  color?: TonThemeColor;
  colorHex?: string;
  colorless?: boolean;
  size?: number;
}

export const Icon = React.memo((props: IconProps) => {
  const {
    name,
    style,
    color,
    colorHex,
    colorless,
    size: customSize,
    imageStyle: customImageStyle,
  } = props;
  const theme = useTheme();

  const icon = MobileIconsList[name];
  const size = customSize || (IconSizes[name] ?? 12);
  const tintColor = color ? theme.colors[color] : colorHex;

  const sizeStyle = { width: ns(size), height: ns(size) };
  const imageStyle = !colorless
    ? {
        tintColor: tintColor ?? theme.colors.foregroundTertiary,
      }
    : {};

  if (icon) {
    return (
      <View style={[style, sizeStyle]}>
        <Image style={[imageStyle, sizeStyle, customImageStyle]} source={icon} />
      </View>
    );
  } else {
    console.warn(`Icon ${name} does not exist`);
    return <View style={[sizeStyle, { backgroundColor: 'red' }]} />;
  }
});
