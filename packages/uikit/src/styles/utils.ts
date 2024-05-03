import { BlueTheme } from './themes/blue';
import { DarkTheme } from './themes/dark';
import { LightTheme } from './themes/light';
import { Theme, ThemeName } from './themes/theme.type';

export const getThemeByName = (name: ThemeName): Theme => {
  if (name === ThemeName.Dark) {
    return DarkTheme;
  }

  if (name === ThemeName.Light) {
    return LightTheme;
  }

  return BlueTheme;
};
