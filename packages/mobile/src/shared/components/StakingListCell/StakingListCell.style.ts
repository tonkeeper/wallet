import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';
import FastImage from 'react-native-fast-image';

const ICON_SIZE = 44;

export const CellContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const Cell = styled(Highlight).attrs({ useRNGHComponent: true })`
  position: relative;
`;

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${ns(16)}px;
  overflow: hidden;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
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

export const Row = styled.View`
  align-items: center;
  flex-direction: row;
`;

export const SubTitle = styled(Text).attrs(() => ({
  variant: 'body2',
  color: 'foregroundSecondary',
}))``;

export const RightContainer = styled.View`
  margin-left: ${ns(16)}px;
`;
