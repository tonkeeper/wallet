import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';

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
`;

export const NavBarSmallSpacer = styled.View`
  height: ${ns(20)}px;
`;

export const NavBarSpacer = styled.View`
  height: ${IsTablet ? ns(8) : ns(28)}px;
`;
