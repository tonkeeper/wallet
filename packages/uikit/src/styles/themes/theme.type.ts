import { BlueTheme } from './blue';

export type Theme = typeof BlueTheme;

export type ThemeKeys = keyof Theme;

export enum ThemeName {
  Dark = 'dark',
  Light = 'light',
  Blue = 'blue',
}
