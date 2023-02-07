import Animated from 'react-native-reanimated';

import styled from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const Input = styled.TextInput`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  color: ${({ theme }) => theme.colors.backgroundPrimary};
  z-index: 3;
`;

export const Points = styled(Animated.View)`
  flex-direction: row;
  width: ${ns(96)}px;
  justify-content: space-between;
  z-index: 1;
`;

export const Point = styled(Animated.View)`
  width: ${ns(12)}px;
  height: ${ns(12)}px;
  border-radius: ${ns(12 / 2)}px;
`;
