import { Animated, TouchableOpacity } from 'react-native';

import styled, { css } from '$styled';
import { ns, deviceWidth, nfs } from '$utils';
import { Text } from '$uikit/Text/Text';

export const Wrap = styled(Animated.createAnimatedComponent(TouchableOpacity))`
  position: absolute;
  left: 0;
  width: 100%;
  align-items: center;
  background-color: transparent;
  padding-top: ${ns(5)}px;
`;

export const Content = styled(Animated.View)<{ loading?: boolean }>`
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);

  border-radius: ${ns(24)}px;
  padding-right: ${ns(24)}px;
  max-width: ${deviceWidth - ns(16) * 2}px;

  ${({ theme, loading }) => css`
    background-color: ${theme.colors.backgroundTertiary};
    padding-left: ${ns(loading ? 16 : 24)}px;
    padding-vertical: ${ns(loading ? 12 : 14)}px;
  `}
`;

export const ContentSmall = styled(Animated.View)<{ loading?: boolean }>`
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);

  border-radius: ${ns(14)}px;
  max-width: ${deviceWidth - ns(32) * 2}px;

  padding-vertical: ${ns(12)}px;
  padding-horizontal: ${ns(16)}px;

  ${({ theme }) => css`
    background-color: ${theme.colors.backgroundTertiary};
  `}
`;

export const LabelSmall = styled(Text).attrs({
  textAlign: 'center',
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '600',
})<{ loading?: boolean }>`
  ${({ loading }) =>
    loading &&
    css`
      margin-left: ${ns(12)}px;
    `}
`;

export const Label = styled(Text).attrs({
  textAlign: 'center',
  fontSize: 16,
  lineHeight: 22,
  fontWeight: '600',
})<{ loading?: boolean }>`
  ${({ loading }) =>
    loading &&
    css`
      margin-left: ${ns(12)}px;
    `}
`;

const LOADER_WRAPPER_SIZE = ns(28);

export const LoaderWrapper = styled.View`
  width: ${ns(LOADER_WRAPPER_SIZE)}px;
  height: ${ns(LOADER_WRAPPER_SIZE)}px;
  max-width: ${ns(LOADER_WRAPPER_SIZE)}px;
  max-height: ${ns(LOADER_WRAPPER_SIZE)}px;
`;
