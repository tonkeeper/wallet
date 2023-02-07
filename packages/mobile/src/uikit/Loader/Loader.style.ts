import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import styled from '$styled';

export const Wrap = styled(View)`
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
`;

export const Loader = styled(Animated.View)`
  flex: 0 0 auto;
`;
