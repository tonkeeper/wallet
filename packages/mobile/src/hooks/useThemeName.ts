import { ThemeOptions, useAppThemeStore } from '$store/zustand/appTheme';
import { ThemeName } from '@tonkeeper/uikit';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const useThemeName = (): ThemeName => {
  const { selectedTheme } = useAppThemeStore();
  const systemAppearance = useColorScheme();

  const themeName = useMemo(() => {
    if (selectedTheme === ThemeOptions.System) {
      return systemAppearance === 'light' ? ThemeName.Light : ThemeName.Dark;
    }

    if (selectedTheme === ThemeOptions.Light) {
      return ThemeName.Light;
    }

    if (selectedTheme === ThemeOptions.Dark) {
      return ThemeName.Dark;
    }

    return ThemeName.Blue;
  }, [selectedTheme, systemAppearance]);

  return themeName;
};
