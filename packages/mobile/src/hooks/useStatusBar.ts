import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '$hooks/useTheme';
import { setDarkStatusBar, setLightStatusBar } from '$utils';

type StatusBarMode = 'light' | 'dark';

const isLightMode = (mode: StatusBarMode) => mode === 'light';

export function useStatusBar(mode: StatusBarMode): void {
  const { isDark } = useTheme();

  const setStatusBarMode = useCallback(() => {
    /**
     * All screens have light status bar in dark mode
     */
    isDark || isLightMode(mode) ? setLightStatusBar() : setDarkStatusBar();
  }, [isDark, mode]);

  useFocusEffect(setStatusBarMode);
}
