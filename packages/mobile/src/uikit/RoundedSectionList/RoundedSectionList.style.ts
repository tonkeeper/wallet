import styled from '$styled';
import { Highlight } from '../Highlight/Highlight';

export const ItemWrap = styled(Highlight)`
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;
