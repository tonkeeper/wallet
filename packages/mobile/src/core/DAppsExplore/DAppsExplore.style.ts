import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';

export const NavBarSpacerHeight = IsTablet ? ns(8) : ns(28);

export const Wrap = styled.View`
  flex: 1;
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

export const NavBarSpacer = styled.View`
  height: ${NavBarSpacerHeight}px;
`;
