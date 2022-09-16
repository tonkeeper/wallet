import styled, { RADIUS } from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
  margin-bottom: ${ns(16)}px;
`;

export const TitleWrapper = styled.View`
  margin-bottom: ${ns(16)}px;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const TextWrap = styled.View`
  z-index: 2;
  padding: ${ns(16)}px;
`;

export const Badges = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;
