import { PropsWithChildren, createContext, memo, useContext } from 'react';
import { BlueTheme } from '../themes/blue';
import { Theme } from '../themes/theme.type';

const ThemeContext = createContext<Theme>(BlueTheme);

interface Props extends PropsWithChildren {
  theme: Theme;
}

export const ThemeProvider = memo<Props>((props) => {
  return (
    <ThemeContext.Provider value={props.theme}>{props.children}</ThemeContext.Provider>
  );
});

export const useTheme = () => {
  return useContext(ThemeContext);
};
