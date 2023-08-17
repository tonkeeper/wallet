import styled from '$styled';
import { Highlight } from '$uikit';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const Content = styled.View<{ bottomInset: number }>`
  padding: 0 ${ns(16)}px;
  padding-bottom: ${({ bottomInset }) => ns(16) + bottomInset}px;
`;
