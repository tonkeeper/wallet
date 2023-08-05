import styled from '$styled';
import { changeAlphaValue, convertHexToRGBA, ns } from '$utils';
import Animated from 'react-native-reanimated';

const BLUR_SHAPE_SOURCE = require('./blur.png');

export const IconContainer = styled.View<{ size: number; isDefault?: boolean; rounded: boolean }>`
  background: ${({ theme, isDefault }) =>
    isDefault
      ? changeAlphaValue(convertHexToRGBA(theme.colors.backgroundTertiary), 0.56)
      : theme.colors.backgroundTertiary};
  width: ${({ size }) => ns(size)}px;
  height: ${({ size }) => ns(size)}px;
  border-radius: ${({ size, rounded }) => rounded ? ns(size / 2) : 0}px;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

export const BlurBackground = styled.Image.attrs({
  source: BLUR_SHAPE_SOURCE,
  resizeMode: 'contain',
})<{ color: string; size: number }>`
  width: ${({ size }) => ns(size)}px;
  height: ${({ size }) => ns(size)}px;
  position: absolute;
  top: 0;
  left: 0;
  tint-color: ${({ color }) => color};
`;

export const DiamondContainer = styled(Animated.View)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.44 : 1)};
`;
