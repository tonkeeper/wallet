import { ThemeName } from '../styles';

export enum WalletColor {
  SteelGray = 'SteelGray',
  LightSteelGray = 'LightSteelGray',
  Gray = 'Gray',
  LightRed = 'LightRed',
  LightOrange = 'LightOrange',
  LightYellow = 'LightYellow',
  LightGreen = 'LightGreen',
  LightBlue = 'LightBlue',
  LightAquamarine = 'LightAquamarine',
  LightPurple = 'LightPurple',
  LightViolet = 'LightViolet',
  LightMagenta = 'LightMagenta',
  LightFireOrange = 'LightFireOrange',
  Red = 'Red',
  Orange = 'Orange',
  Yellow = 'Yellow',
  Green = 'Green',
  Blue = 'Blue',
  Aquamarine = 'Aquamarine',
  Purple = 'Purple',
  Violet = 'Violet',
  Magenta = 'Magenta',
  FireOrange = 'FireOrange',
}

const BLUE_THEME_COLORS = {
  [WalletColor.SteelGray]: '#293342',
  [WalletColor.LightSteelGray]: '#424C5C',
  [WalletColor.Gray]: '#9DA2A4',
  [WalletColor.LightRed]: '#FF8585',
  [WalletColor.LightOrange]: '#FFA970',
  [WalletColor.LightYellow]: '#FFC95C',
  [WalletColor.LightGreen]: '#85CC7A',
  [WalletColor.LightBlue]: '#70A0FF',
  [WalletColor.LightAquamarine]: '#6CCCF5',
  [WalletColor.LightPurple]: '#AD89F5',
  [WalletColor.LightViolet]: '#F57FF5',
  [WalletColor.LightMagenta]: '#F576B1',
  [WalletColor.LightFireOrange]: '#F57F87',
  [WalletColor.Red]: '#FF5252',
  [WalletColor.Orange]: '#FF8B3D',
  [WalletColor.Yellow]: '#FFB92E',
  [WalletColor.Green]: '#69CC5A',
  [WalletColor.Blue]: '#528BFF',
  [WalletColor.Aquamarine]: '#47C8FF',
  [WalletColor.Purple]: '#925CFF',
  [WalletColor.Violet]: '#FF5CFF',
  [WalletColor.Magenta]: '#FF479D',
  [WalletColor.FireOrange]: '#FF525D',
};

const DARK_THEME_COLORS = {
  ...BLUE_THEME_COLORS,
  [WalletColor.SteelGray]: '#2F2F33',
  [WalletColor.LightSteelGray]: '#4E4E52',
  [WalletColor.Gray]: '#8D8D93',
};

const LIGHT_THEME_COLORS = {
  ...BLUE_THEME_COLORS,
  [WalletColor.SteelGray]: '#818C99',
  [WalletColor.LightSteelGray]: '#95A0AD',
  [WalletColor.Gray]: '#B6BBC2',
};

export const getWalletColorHex = (color: WalletColor, themeName: ThemeName) => {
  if (themeName === ThemeName.Dark) {
    return DARK_THEME_COLORS[color];
  }
  if (themeName === ThemeName.Light) {
    return LIGHT_THEME_COLORS[color];
  }
  return BLUE_THEME_COLORS[color];
};
