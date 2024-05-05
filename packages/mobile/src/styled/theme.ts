import { Theme, ThemeName } from '@tonkeeper/uikit';
import {
  DARK_COLORS,
  COMMON_COLORS,
  CONSTANT_COLORS,
  BLUE_COLORS,
  LIGHT_COLORS,
} from './colors';
import { FONT } from './fonts';
import { DARK_GRADIENTS } from './gradients';
import { RADIUS } from './radius';
import { getThemeByName } from '@tonkeeper/uikit/src/styles/utils';

type ThemeSpecificColor = keyof typeof DARK_COLORS;
type ConstantColor = keyof typeof CONSTANT_COLORS;
type CommonColor = keyof typeof COMMON_COLORS;

export enum ThemeNames {
  light = 'light',
  dark = 'dark',
}

export type TonThemeColor =
  | ThemeSpecificColor
  | ConstantColor
  | CommonColor
  | keyof Theme;

const CommonTheme = {
  font: FONT,
  radius: RADIUS,
  colors: {
    ...CONSTANT_COLORS,
    ...COMMON_COLORS,
  },
};

export const LightTheme = {
  ...CommonTheme,
  isDark: false,
  gradients: DARK_GRADIENTS,
  colors: {
    ...CommonTheme.colors,
    ...LIGHT_COLORS,
  },
};

export const BlueTheme = {
  ...CommonTheme,
  isDark: true,
  gradients: DARK_GRADIENTS,
  colors: {
    ...CommonTheme.colors,
    ...BLUE_COLORS,
  },
};

export const DarkTheme = {
  ...CommonTheme,
  isDark: true,
  gradients: DARK_GRADIENTS,
  colors: {
    ...CommonTheme.colors,
    ...DARK_COLORS,
  },
};

export type TonTheme = {
  isDark: boolean;
  font: typeof FONT;
  gradients: typeof DARK_GRADIENTS;
  radius: typeof RADIUS;
  colors: {
    [key in TonThemeColor]: string;
  };
};
