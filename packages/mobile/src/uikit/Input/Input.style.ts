import Animated from 'react-native-reanimated';

import styled, { css } from '$styled';
import { changeAlphaValue, convertHexToRGBA, isAndroid, ns } from '$utils';
import { TextInput } from './TextInput';

export const InputWrapper = styled.View<{
  wrapperStyle: ReturnType<typeof css>;
  isFailed: boolean;
}>`
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  background-color: ${({ theme, isFailed }) =>
    isFailed
      ? changeAlphaValue(convertHexToRGBA(theme.colors.accentNegative), 0.08)
      : theme.colors.backgroundSecondary};
  padding-horizontal: ${ns(16)}px;

  ${({ wrapperStyle }) => wrapperStyle};
  position: relative;
`;

export const Border = styled(Animated.View)<{ isFocused: boolean; isFailed: boolean }>`
  background: transparent;
  border: ${ns(1.5)}px solid transparent;
  ${({ isFocused, theme, isFailed }) =>
    `border-color: ${
      theme.colors[
        isFailed ? 'accentNegative' : isFocused ? 'accentPrimary' : 'backgroundSecondary'
      ]
    }`};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  z-index: 1;
`;

export const Input = styled(TextInput)<{ inputStyle: ReturnType<typeof css> }>`
  ${({ theme: { font, colors } }) => css`
    font-family: ${font.regular};
    color: ${colors.foregroundPrimary};
  `}

  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  font-size: ${ns(16)}px;
  /* line-height корректно не работает на IOS, поэтому оставляем дефолтное значение и делаем больше padding  */

  border-width: 0;
  margin: 0;
  z-index: 3;
  align-items: center;

  ${() => {
    if (!isAndroid) {
      return `
        padding-top: ${ns(18.5)}px;
        padding-bottom: ${ns(18)}px;
      `;
    } else {
      return `
        padding-top: ${ns(14)}px;
        padding-bottom: ${ns(14.5)}px;
      `;
    }
  }}

  ${({ inputStyle }) => inputStyle};
`;

export const InputText = styled.Text`
  font-size: ${ns(16)}px;
  ${({ theme: { font, colors } }) => css`
    font-family: ${font.regular};
    color: ${colors.foregroundPrimary};
  `}
  padding: 0;

  ${() => {
    if (isAndroid) {
      return `
      line-height: ${ns(24)}px;
      `;
    }
  }}
`;

export const GhostTextContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 ${16}px;
  opacity: 0;
  align-items: flex-start;
`;
