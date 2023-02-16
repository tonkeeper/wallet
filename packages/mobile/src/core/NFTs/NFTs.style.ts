import { IsTablet } from '$shared/constants';
import styled, { css } from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const RightButtonIconWrap = styled.View`
  margin-left: ${ns(-4)}px;
  margin-right: ${ns(4)}px;
`;

export const RightButtonContainer = styled.View`
  ${() =>
    IsTablet &&
    css`
      margin-right: ${ns(16)}px;
    `}
`;
