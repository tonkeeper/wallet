import styled from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const SHADOW_INPUT_PADDING = 500;

export const Container = styled(Animated.View)<{ bottomInset: number }>`
  flex: 1;
  max-height: 100%;
  padding: 0 ${ns(16)}px ${({ bottomInset }) => bottomInset + ns(16)}px ${ns(16)}px;
`;
