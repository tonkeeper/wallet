import styled from '$styled';
import { ns } from '$utils';

export const Container = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(16)}px;
  padding: ${ns(16)}px;
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
