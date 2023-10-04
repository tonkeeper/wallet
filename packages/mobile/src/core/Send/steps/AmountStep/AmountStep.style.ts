import styled, { RADIUS } from '$styled';
import { Highlight } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const SHADOW_INPUT_PADDING = 500;

export const Container = styled(Animated.View)<{ bottomInset: number }>`
  flex: 1;
  padding: 0 ${ns(16)}px ${({ bottomInset }) => bottomInset + ns(16)}px ${ns(16)}px;
`;

export const AmountContainer = styled.View`
  flex: 1;
  position: relative;
`;

export const CoinContainer = styled.View`
  position: absolute;
  z-index: 1000;
  top: ${ns(16)}px;
  left: ${ns(64)}px;
  right: ${ns(64)}px;
  align-items: center;
`;
