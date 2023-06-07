import { DarkTheme } from './dark';

type ThemeGradient =
  | 'gradientBackgroundTop'
  | 'gradientBackgroundBottom'
  | 'gradientBlueTop'
  | 'gradientBlueBottom'
  | 'gradientGreen'
  | 'gradientRed';

export type Theme =  Omit<typeof DarkTheme, ThemeGradient>;

export type ThemeKeys = keyof Theme;
