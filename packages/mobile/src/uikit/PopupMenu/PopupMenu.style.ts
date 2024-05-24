import Animated from 'react-native-reanimated';

import styled from '$styled';
import { ns } from '$utils';

export const Overlay = styled.TouchableOpacity.attrs({
  activeOpacity: 0,
})`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
`;

export const Wrap = styled(Animated.View)<{ width?: number }>`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  flex: 0 0 auto;
  align-self: flex-end;
  margin-horizontal: ${ns(16)}px;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  box-shadow: 0px ${ns(8)}px ${ns(32)}px rgba(0, 0, 0, 0.16);
  width: ${({ width }) => ns(width ?? 160)}px;
  z-index: 2;
`;

export const Content = styled.View`
  overflow: hidden;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
`;

export const Item = styled.View`
  height: ${ns(48)}px;
  flex-direction: row;
  padding-horizontal: ${ns(16)}px;
  align-items: center;
`;

export const ItemCont = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const ItemCheckedWrap = styled.View`
  width: ${ns(16)}px;
  height: ${ns(16)}px;
  flex: 0 0 auto;
`;
