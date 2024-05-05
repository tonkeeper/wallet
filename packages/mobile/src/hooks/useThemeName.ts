import { ThemeOptions, useAppThemeStore } from '$store/zustand/appTheme';
import { ThemeName } from '@tonkeeper/uikit';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export const useThemeName = (): ThemeName => {
  const { selectedTheme } = useAppThemeStore();
  const colorScheme = useColorScheme();
  const [systemAppearance, setSystemAppearance] = useState(colorScheme);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSystemAppearance(colorScheme);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [colorScheme]);

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
