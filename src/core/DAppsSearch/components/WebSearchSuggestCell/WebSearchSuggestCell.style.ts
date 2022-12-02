import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';

export const CellContainer = styled.View<{ selected: boolean }>`
  background: ${({ selected, theme }) =>
    selected ? theme.colors.backgroundTertiary : theme.colors.backgroundSecondary};
`;

export const Cell = styled(Highlight)`
  position: relative;
`;

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 ${ns(16)}px;
  height: ${ns(48)}px;
  overflow: hidden;
`;

export const IconContainer = styled.View`
  margin-right: ${ns(13)}px;
`;

export const Title = styled(Text).attrs(() => ({
  numberOfLines: 1,
}))`
  flex: 1;
`;
