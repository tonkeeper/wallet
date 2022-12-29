import styled from '$styled';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)<{ autoHeight: boolean }>`
  flex: ${({ autoHeight }) => (autoHeight ? 1 : 'auto')};
  align-items: flex-start;
  flex-direction: row;
`;

export const Step = styled.View<{ width: number; autoHeight: boolean }>`
  width: ${({ width }) => width}px;
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '100%')};
`;
