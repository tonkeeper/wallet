import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { TTextVariants, textVariants } from './Text.variants';
import { FONT_BY_WEIGHT, TonThemeColor } from '$styled';
import { useTheme } from '$hooks/useTheme';
import { nfs } from '$utils/style';
import { pickBy, identity } from 'lodash';
import Animated, { AnimateProps } from 'react-native-reanimated';

export interface TextProps extends AnimateProps<RNTextProps> {
  variant?: TTextVariants;
  color?: TonThemeColor;
  fontSize?: number;
  fontWeight?: keyof typeof FONT_BY_WEIGHT;
  lineHeight?: number;
  reanimated?: boolean;
  textAlign?: TextStyle['textAlign'];
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  fontWeight,
  fontSize,
  lineHeight,
  textAlign,
  reanimated,
  color = 'foregroundPrimary',
  variant = 'body1',
  ...textProps
}) => {
  const theme = useTheme();
  const TextComponent: any = useMemo(
    () => (reanimated ? Animated.Text : RNText),
    [reanimated],
  );

  const internalStyle = useMemo(() => {
    return pickBy(
      {
        color: theme.colors[color],
        fontFamily: fontWeight && FONT_BY_WEIGHT[fontWeight],
        lineHeight: lineHeight && nfs(lineHeight),
        textAlign,
        fontSize: fontSize && nfs(fontSize),
      },
      identity,
    );
  }, [textAlign, color, fontSize, fontWeight, lineHeight, theme.colors]);

  return (
    <TextComponent
      allowFontScaling={false}
      style={[textVariants[variant], internalStyle, style]}
      {...textProps}
    >
      {children}
    </TextComponent>
  );
};
