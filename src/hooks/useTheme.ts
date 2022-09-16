import { useContext } from 'react';
import { ThemeContext } from 'styled-components/native';

import { TonTheme } from '$styled/theme';

export const useTheme = (): TonTheme => {
  return useContext(ThemeContext);
};
