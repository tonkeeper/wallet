import styled from '$styled';
import { Highlight } from '$uikit';

export const ItemWrap = styled(Highlight)`
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;
