import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View<{ skipMargin: boolean }>`
  height: ${ns(56)}px;
  flex-direction: row;
  align-items: center;
  margin-top: ${({ skipMargin }) => (skipMargin ? 0 : ns(16))}px;
`;