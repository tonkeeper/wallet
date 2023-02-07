import * as styledComponents from 'styled-components/native';

import { TonTheme } from './theme';

const {
  css,
  ThemeProvider,
  default: styled,
} = styledComponents as unknown as styledComponents.ReactNativeThemedStyledComponentsModule<TonTheme>;

export * from './theme';
export * from './fonts';
export * from './colors';
export * from './gradients';
export * from './radius';
export * from './accent';
export default styled;
export { css, ThemeProvider };
