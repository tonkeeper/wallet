import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';
import FastImage from 'react-native-fast-image';

const ICON_SIZE = 44;

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
  padding: ${ns(16)}px;
  overflow: hidden;
`;

export const IconContainer = styled.View`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  border-radius: ${ns(12)}px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundQuaternary};
  align-items: center;
  justify-content: center;
  margin-right: ${ns(16)}px;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
  priority: FastImage.priority.high,
})`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
`;

export const Content = styled.View`
  flex: 1;
`;

export const Title = styled(Text).attrs(() => ({
  variant: 'label1',
  numberOfLines: 1,
}))``;

export const SubTitle = styled(Text).attrs(() => ({
  numberOfLines: 1,
  color: 'foregroundSecondary',
}))``;
