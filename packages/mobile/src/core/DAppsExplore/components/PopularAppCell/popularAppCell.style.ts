import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';
import FastImage from 'react-native-fast-image';

const ICON_SIZE = 44;

export const CellContainer = styled.View``;

export const Cell = styled(Highlight).attrs({ useRNGHComponent: true })`
  position: relative;
`;

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 ${ns(16)}px;
  height: ${ns(76)}px;
  overflow: hidden;
`;

export const IconContainer = styled.View<{ isMore?: boolean }>`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  border-radius: ${({ isMore }) => ns(isMore ? 0 : 12)}px;
  overflow: hidden;
  background: ${({ theme, isMore }) =>
    isMore ? 'transparent' : theme.colors.backgroundQuaternary};
  align-items: center;
  justify-content: center;
  margin-right: ${ns(16)}px;
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
  variant: 'label2',
  numberOfLines: 1,
}))``;

export const SubTitle = styled(Text).attrs(() => ({
  variant: 'body3Alt',
  numberOfLines: 2,
  color: 'foregroundSecondary',
}))``;

export const ChervonContainer = styled.View`
  margin-left: ${ns(16)}px;
`;
