import styled from '$styled';
import { nfs, ns } from '$utils';

export const Content = styled.View`
  padding: 0 ${ns(16)}px ${ns(32)}px;
`;

export const Words = styled.View`
  flex-direction: row;
  padding-top: ${ns(24)}px;
  width: 100%;
  justify-content: center;
`;

export const WordsColumn = styled.View`
  flex: 0 0 auto;
  width: ${ns(122)}px;
`;

export const WordsItem = styled.View`
  flex-direction: row;
  height: ${ns(24)}px;
  margin-top: ${ns(8)}px;
  align-items: center;
`;

export const WordsItemNumberWrapper = styled.View`
  width: ${ns(24)}px;
`;
