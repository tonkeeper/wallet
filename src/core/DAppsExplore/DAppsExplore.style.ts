import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const ScrollViewContainer = styled.View`
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

export const SearchBarContainer = styled.View<{ tabBarHeight: number }>`
  margin-bottom: ${({ tabBarHeight }) => tabBarHeight}px;
  padding: ${ns(16)}px;
`;
