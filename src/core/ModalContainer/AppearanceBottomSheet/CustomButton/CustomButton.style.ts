import styled from '$styled';
import { Button as UIButton } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled.View`
  position: relative;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const ButtonBackground = styled(Animated.View)<{ color: string }>`
  background: ${({ color }) => color};
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const Button = styled(UIButton)`
  background: transparent;
  z-index: 2;
`;
