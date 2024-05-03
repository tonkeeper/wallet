import styled from '$styled';
import { nfs, ns } from '$utils';
import { Highlight } from '../../Highlight/Highlight';
import { Text } from '../../Text/Text';

export const Wrap = styled.View`
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const Cell = styled(Highlight)``;

export const CellIn = styled.View`
  flex-direction: row;
  padding: ${ns(16)}px;
  overflow: hidden;
`;

export const CellLabel = styled(Text).attrs(() => ({
  variant: 'body1',
  color: 'foregroundSecondary',
}))``;

export const CellValue = styled(Text).attrs(() => ({
  variant: 'label1',
  textAlign: 'right',
}))`
  margin-left: ${ns(16)}px;
  text-align: right;
  flex: 1;
`;
