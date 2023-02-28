import Animated from 'react-native-reanimated';

import styled from '$styled';
import { hNs, ns } from '$utils';
import { LargeNavBarHeight, NavBarHeight } from '$shared/constants';
import { Text } from '$uikit/Text/Text';

export const Wrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

export const Background = styled(Animated.View)`
  z-index: 1;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${hNs(NavBarHeight)}px;
`;

export const Cont = styled.View`
  flex-direction: row;
  height: ${hNs(NavBarHeight)}px;
  align-items: center;
  position: relative;
  z-index: 2;
`;

export const TitleMini = styled(Text).attrs({
  variant: 'h3',
  color: 'foregroundPrimary',
})``;

export const LargeTextWrap = styled(Animated.View)`
  flex: 1;
  align-items: flex-start;
  z-index: -1;
`;

export const TextWrap = styled(Animated.View)`
  align-items: center;
`;

export const LargeWrap = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: ${hNs(LargeNavBarHeight)}px;
  align-items: center;
  flex-direction: row;
  padding-horizontal: ${ns(16)}px;
  padding-top: ${hNs(16)}px;
`;

export const RightContentWrap = styled(Animated.View)`
  position: absolute;
  padding-top: ${hNs(16)}px;
  height: ${hNs(LargeNavBarHeight)}px;
  right: ${ns(16)}px;
  z-index: 10;
  top: 0;
  bottom: 0;
  justify-content: center;
`;

export const SmallWrap = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: ${hNs(NavBarHeight)}px;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${ns(16)}px;
`;

export const LargeBottomComponentWrap = styled.View`
  margin-bottom: ${ns(8.5)}px;
`;

export const BottomComponentWrap = styled.View`
  margin-bottom: ${ns(2.5)}px;
`;

export const NavBarDivider = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.5px;
  height: 0.5px;
  z-index: 10;
  background: ${({ theme }) => theme.colors.separatorCommon};
`;
