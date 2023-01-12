import styled from '$styled';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)`
  align-items: flex-start;
  flex-direction: row;
`;

export const Step = styled.View<{ width: number; autoHeight: boolean }>`
  width: ${({ width }) => width}px;
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '100%')};
`;
