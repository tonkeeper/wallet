import styled from '$styled';
import { hNs, ns } from '$utils';

export const LoaderWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Contain = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  margin: 0 ${hNs(16)}px;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
`;
