import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const NavBarSpacerHeight = IsTablet ? ns(8) : ns(28);

export const Wrap = styled.View`
  flex: 1;
`;

export const ScrollViewContainer = styled.View<{ topInset: number }>`
  flex: 1;
  padding-top: ${({ topInset }) => topInset}px;
`;

// Special width for tablets or big devices
export const Content = styled.View`
  ${() =>
    IsTablet &&
    css`
      width: ${TabletMaxWidth}px;
    `}
`;

export const ContentWrapper = styled.View`
  ${() =>
    IsTablet &&
    css`
      align-items: center;
    `}
`;

export const SearchBarContainer = styled.View<{ tabBarHeight: number }>`
  margin-bottom: ${({ tabBarHeight }) => tabBarHeight}px;
  padding: ${ns(16)}px ${ns(IsTablet ? 0 : 16)}px;
  position: relative;
`;

export const SearchBarDivider = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: -0.5px;
  height: 0.5px;
  background: ${({ theme }) => theme.colors.separatorCommon};
`;

export const TopTabsDivider = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.5px;
  height: 0.5px;
  background: ${({ theme }) => theme.colors.separatorCommon};
`;

export const NavBarSmallSpacer = styled.View`
  height: ${ns(20)}px;
`;

export const NavBarSpacer = styled.View`
  height: ${NavBarSpacerHeight}px;
`;
