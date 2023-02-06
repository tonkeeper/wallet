import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';

export const Container = styled.View`
  padding: 0 ${ns(IsTablet ? 0 : 16)}px;
  margin-bottom: ${ns(16)}px;
`;

// Special width for tablets or big devices
export const Content = styled.View`
  ${() =>
    IsTablet &&
    css`
      width: ${TabletMaxWidth}px;
    `}
`;
