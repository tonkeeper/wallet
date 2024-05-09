import { View, Image, ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { IconSizes, IconNames } from './Icon.types';
import { IconList } from './IconList.native';
import { useTheme } from '../../styles';
import { ns } from '../../utils';
import { memo } from 'react';

export type IconColors =
  | 'iconPrimary'
  | 'iconSecondary'
  | 'iconTertiary'
  | 'iconPrimaryAlternate'
  | 'constantWhite'
  | 'constantBlack'
  | 'accentBlue'
  | 'accentOrange'
  | 'accentRed'
  | 'accentGreen'
  | 'buttonSecondaryForeground'
  | 'buttonPrimaryForeground';

export interface IconProps {
  name: IconNames;
  style?: ViewStyle;
  imageStyle?: StyleProp<ImageStyle>;
  color?: IconColors;
  colorHex?: string;
  colorless?: boolean;
  size?: number;
}

export const Icon = memo((props: IconProps) => {
  const {
    name,
    style,
    color = 'iconPrimary',
    colorHex,
    colorless,
    size: customSize,
    imageStyle: customImageStyle,
  } = props;
  const theme = useTheme();

  const icon = IconList[name];
  const size = customSize || (IconSizes[name] ?? 12);
  const tintColor = colorHex ?? theme[color];

  const sizeStyle = { width: ns(size), height: ns(size) };
  const imageStyle = !colorless
    ? {
        tintColor: tintColor ?? theme.iconTertiary,
      }
    : undefined;

  if (icon) {
    return (
      <View style={[sizeStyle, style]}>
        <Image style={[imageStyle, sizeStyle, customImageStyle]} source={icon} />
      </View>
    );
  } else {
    console.warn(`Icon ${name} does not exist`);
    return <View style={[sizeStyle, { backgroundColor: 'red' }]} />;
  }
});
