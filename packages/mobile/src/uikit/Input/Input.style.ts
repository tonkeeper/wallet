import Animated from 'react-native-reanimated';

import styled, { css } from '$styled';
import { changeAlphaValue, convertHexToRGBA, isAndroid, ns } from '$utils';
import { TextInput } from './TextInput';

export const InputWrapper = styled.View<{
  wrapperStyle: ReturnType<typeof css>;
  isFailed: boolean;
  withClearButton: boolean;
}>`
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  background-color: ${({ theme, isFailed }) =>
    isFailed ? theme.colors.fieldErrorBackground : theme.colors.fieldBackground};
  padding-horizontal: ${ns(16)}px;
  padding-right: ${({ withClearButton }) => ns(withClearButton ? 52 : 16)}px;

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

export const Input = styled(TextInput)<{
  inputStyle: ReturnType<typeof css>;
  isLarge: boolean;
}>`
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
  padding: 0;

  ${({ isLarge }) => {
    if (!isAndroid) {
      return `
        padding-top: ${isLarge ? ns(22.5) : ns(18.5)}px;
        padding-bottom: ${isLarge ? ns(22) : ns(18)}px;
      `;
    } else {
      return `
        padding-top: ${isLarge ? ns(18) : ns(14)}px;
        padding-bottom: ${isLarge ? ns(18.5) : ns(14.5)}px;
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

export const LabelContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-horizontal: ${ns(16)}px;
`;

export const RightContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 4;
`;

export const RightButton = styled.TouchableOpacity`
  padding: 0 ${ns(20)}px;
  height: 100%;
  justify-content: center;
`;
