import Animated from 'react-native-reanimated';

import styled from '$styled';
import { deviceWidth, nfs, ns } from '$utils';
import {Text} from "$uikit";

export const Content = styled.View`
  flex: 1;
  overflow: hidden;
`;

export const PinWrap = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const Title = styled(Text).attrs({ variant: 'h3' })``;

export const Pin = styled.View`
  margin-top: ${ns(20)}px;
  height: ${ns(12)}px;
`;

export const Steps = styled(Animated.View)`
  flex-direction: row;
  flex: 1;
`;

export const Step = styled.View`
  flex: 0 0 auto;
  width: ${deviceWidth}px;
`;
