import { Animated } from 'react-native';

import styled from '$styled';
import { nfs, ns } from '$utils';
import { Opacity } from '$shared/constants';
import { Highlight } from '../Highlight/Highlight';

export const Clickable = styled(Highlight)`
  border-radius: ${({ theme }) => theme.radius.normal}px;
`;

export const AnimWrap = styled(Animated.View)`
  overflow: hidden;
  padding-bottom: ${ns(16)}px;
`;

export const Wrap = styled.View`
  padding-top: ${ns(12)}px;
  padding-bottom: ${ns(14)}px;
  padding-horizontal: ${ns(16)}px;
  position: relative;
  flex: 0 0 auto;
`;

export const CloseButton = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  position: absolute;
  top: 0;
  z-index: 1000;
  right: 0;
  width: ${ns(48)}px;
  height: ${ns(48)}px;
  align-items: center;
  justify-content: center;
`;

export const Action = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ActionTextWrapper = styled.View`
  margin-right: ${ns(4)}px;
`;
