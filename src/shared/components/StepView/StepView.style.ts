import styled from '$styled';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
`;

export const Step = styled.View<{ width: number }>`
  width: ${({ width }) => width}px;
  height: 100%;
  overflow: hidden;
`;
