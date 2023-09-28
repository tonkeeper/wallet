import styled from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const Content = styled.View<{ bottomInset: number }>`
  padding: 0 ${ns(16)}px;
  padding-bottom: ${({ bottomInset }) => bottomInset}px;
`;

export const TitleContainer = styled.View`
  padding: ${ns(14)}px 0;
`;

export const LargeTitleContainer = styled.View`
  align-items: center;
  padding: 0 ${ns(16)}px;
`;
