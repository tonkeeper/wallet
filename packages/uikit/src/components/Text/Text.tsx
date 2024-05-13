import {
  Text as NativeText,
  TextProps as NativeTextProps,
  TextStyle,
} from 'react-native';
import Animated, { AnimateProps } from 'react-native-reanimated';
import { FontWeights, TTextTypes, TextTypes } from './TextStyles';
import { pickBy, identity } from 'lodash';
import { Steezy, useTheme } from '../../styles';
import { memo, useMemo } from 'react';
import { nfs } from '../../utils';

export type TextColors =
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textAccent'
  | 'textPrimaryAlternate'
  | 'accentOrange'
  | 'accentRed'
  | 'accentGreen'
  | 'accentBlue'
  | 'accentPurple'
  | 'constantWhite'
  | 'constantBlack'
  | 'buttonPrimaryForeground'
  | 'buttonSecondaryForeground';

export interface TextProps extends AnimateProps<NativeTextProps> {
  type?: TTextTypes;
  color?: TextColors;
  fontSize?: number;
  fontWeight?: keyof typeof FontWeights;
  lineHeight?: number;
  reanimated?: boolean;
  textAlign?: TextStyle['textAlign'];
}

export const Text = memo<TextProps>((props) => {
  const {
    children,
    style,
    fontWeight,
    fontSize,
    lineHeight,
    textAlign,
    reanimated,
    color: textColor = 'textPrimary',
    type = 'body1',
    ...textProps
  } = props;

  const theme = useTheme();

  const color = theme[textColor];
  const TextComponent: any = useMemo(
    () => (reanimated ? Animated.Text : NativeText),
    [reanimated],
  );

  const internalStyle = useMemo(() => {
    return pickBy(
      {
        color,
        fontFamily: fontWeight && FontWeights[fontWeight],
        lineHeight: lineHeight && nfs(lineHeight),
        textAlign,
        fontSize: fontSize && nfs(fontSize),
      },
      identity,
    );
  }, [textAlign, color, fontSize, fontWeight, lineHeight, color]);

  return (
    <TextComponent
      allowFontScaling={false}
      style={[TextTypes[type], internalStyle, style]}
      {...textProps}
    >
      {children}
    </TextComponent>
  );
});

export const SText = Steezy.withStyle(Text);
