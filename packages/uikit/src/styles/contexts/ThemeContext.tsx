import { PropsWithChildren, createContext, memo, useContext } from 'react';
import { DarkTheme } from '../themes/dark';

const ThemeContext = createContext(DarkTheme);

export const ThemeProvider = memo<PropsWithChildren>((props) => {
  return (
    <ThemeContext.Provider value={DarkTheme}>
      {props.children}
    </ThemeContext.Provider>
  )
});

export const useTheme = () => {
  return useContext(ThemeContext);
};