import Animated from 'react-native-reanimated';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled(Animated.View)`
  padding: ${ns(16)}px ${ns(16)}px ${ns(16)}px ${ns(16)}px;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  width: ${ns(136)}px;
  height: ${ns(136)}px;
  position: absolute;
  left: ${ns(57)}px;
  top: ${ns(28)}px;
`;

export const AmountWrap = styled.View``;
