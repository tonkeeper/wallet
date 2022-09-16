import { Animated } from 'react-native';
import Renimated from 'react-native-reanimated';

import styled from '$styled';
import { deviceWidth } from '$utils';

export const Steps = styled(Renimated.View)`
  flex-direction: row;
  flex: 1;
`;

export const Step = styled.View`
  flex: 0 0 auto;
  width: ${deviceWidth}px;
`;

export const ImportWrap = styled(Animated.View)`
  flex: 1;
`;
