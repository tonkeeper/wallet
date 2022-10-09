import styled from '$styled';
import Animated from 'react-native-reanimated';

export const Wrap = styled.View`
  flex: 1;
`;

export const Margin = styled.View`
  margin-bottom: 12px;
`;

export const ContentWrap = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;
