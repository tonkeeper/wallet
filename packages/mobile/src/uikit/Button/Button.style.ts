import { Text } from 'react-native';

import styled, { fontKeys } from '$styled';
import { nfs, ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Button = styled(Animated.View)<{
  mode: string;
  size: string;
  isPressed: boolean;
  inverted: boolean;
  withoutFixedHeight: boolean;
  disabled: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  ${({ mode, theme, isPressed, inverted, disabled }) => {
    if (mode === 'secondary') {
      return `
        background: ${
          inverted
            ? theme.colors[
                isPressed
                  ? 'buttonSecondaryBackground'
                  : 'buttonSecondaryBackgroundHighlighted'
              ]
            : theme.colors[
                isPressed
                  ? 'buttonSecondaryBackgroundHighlighted'
                  : 'buttonSecondaryBackground'
              ]
        };
      `;
    } else if (mode === 'tertiary') {
      return '';
    } else if (mode === 'primary_red') {
      return `
        background: ${theme.colors.accentNegative};
      `;
    } else if (mode === 'light') {
      return `
        background:  ${isPressed ? '#E4E5E6' : theme.colors.foregroundPrimary};
      `;
    } else {
      return `
        background: ${
          disabled
            ? theme.colors.buttonPrimaryBackgroundDisabled
            : isPressed
            ? theme.colors.buttonPrimaryBackgroundHighlighted
            : theme.colors.buttonPrimaryBackground
        };
      `;
    }
  }}

  ${({ size, theme, withoutFixedHeight }) => {
    if (size === 'navbar_small') {
      return `
        ${!withoutFixedHeight && `height: ${ns(32)}px`};
        padding: 0 ${ns(12)}px;
        min-width: ${ns(32)}px;
        border-radius: ${ns(32 / 2)}px;
      `;
    } else if (size === 'navbar_icon') {
      return `
        ${!withoutFixedHeight && `height: ${ns(32)}px`};
        width: ${ns(32)}px;
        border-radius: ${ns(32 / 2)}px;
        padding: ${ns(8)}px;
      `;
    } else if (size === 'small') {
      return `
        ${!withoutFixedHeight && `height: ${ns(36)}px`};
        min-width: ${ns(36)}px;
        border-radius: ${ns(36 / 2)}px;
      `;
    } else if (size === 'large_rounded') {
      return `
        ${!withoutFixedHeight && `height: ${ns(48)}px`};
        min-width: ${ns(48)}px;
        border-radius: ${ns(48 / 2)}px;
      `;
    } else if (size === 'medium_rounded') {
      return `
        height: ${ns(36)}px;
        border-radius: ${ns(theme.radius.large)}px;
        padding-horizontal: ${ns(16)}px;
      `;
    } else {
      return `
        ${!withoutFixedHeight && `height: ${ns(56)}px`};
        min-width: ${ns(56)}px;
        border-radius: ${ns(theme.radius.normal)}px;
      `;
    }
  }}
`;

export const Title = styled(Text).attrs({ allowFontScaling: false })<{
  mode: string;
  disabled: boolean;
  size: string;
  withoutTextPadding: boolean;
  font?: fontKeys;
  isPressed?: boolean;
}>`
  ${({ mode, theme, isPressed }) => {
    if (mode === 'tertiary') {
      return `
        color: ${
          isPressed ? theme.colors.foregroundSecondary : theme.colors.foregroundPrimary
        };
      `;
    } else if (mode === 'light') {
      return `
        color: ${theme.colors.backgroundPrimary};
      `;
    } else if (mode === 'secondary') {
      return `
        color: ${theme.colors.buttonSecondaryForeground};
      `;
    } else {
      return `
        color: ${theme.colors.buttonPrimaryForeground};
      `;
    }
  }}
  font-family: ${({ theme, font }) => (font ? theme.font[font] : theme.font.medium)};

  ${({ disabled }) => `opacity: ${disabled ? 0.32 : 1};`}

  ${({ size, withoutTextPadding }) => {
    if (size === 'navbar_small') {
      return `
        font-size: ${nfs(withoutTextPadding ? 0 : 14)}px;
        line-height: ${nfs(20)}px;
      `;
    } else if (size === 'small') {
      return `
        padding: 0 ${ns(withoutTextPadding ? 0 : 16)}px;
        font-size: ${nfs(14)}px;
        line-height: ${nfs(20)}px;
      `;
    } else if (size === 'large_rounded') {
      return `
        padding: 0 ${ns(withoutTextPadding ? 0 : 20)}px;
        font-size: ${nfs(16)}px;
        line-height: ${nfs(24)}px;
      `;
    } else if (size === 'medium_rounded') {
      return `
        padding: 0 ${ns(withoutTextPadding ? 16 : 0)}px;
        font-size: ${nfs(14)}px;
        line-height: ${nfs(20)}px;
      `;
    } else {
      return `
        padding: 0 ${ns(withoutTextPadding ? 16 : 0)}px;
        font-size: ${nfs(16)}px;
        line-height: ${nfs(24)}px;
      `;
    }
  }}
`;
