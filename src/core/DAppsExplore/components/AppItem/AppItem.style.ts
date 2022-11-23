import { APPS_ITEMS_IN_ROW } from '$core/DAppsExplore/constants';
import styled, { RADIUS } from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';
import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

const deviceWidth = Dimensions.get('window').width;

const ICON_SIZE = ns(64);

const CONTAINER_WIDTH = ICON_SIZE + ns(16);

const MARGIN_BETWEEN =
  (deviceWidth - ns(16) * 2 - CONTAINER_WIDTH * APPS_ITEMS_IN_ROW) /
  (APPS_ITEMS_IN_ROW - 1);

export const Container = styled.View<{ withoutMargin: boolean }>`
  align-items: center;
  padding: ${ns(8)}px;
  margin-right: ${({ withoutMargin }) => (withoutMargin ? 0 : MARGIN_BETWEEN)}px;
  margin-bottom: ${ns(8)}px;
  width: ${CONTAINER_WIDTH}px;
`;

export const IconContainer = styled.View`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  border-radius: ${ns(RADIUS.normal)}px;
  margin-bottom: ${ns(8)}px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  align-items: center;
  justify-content: center;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
  priority: FastImage.priority.high,
})`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
`;

export const Title = styled(Text).attrs({
  variant: 'body3',
  color: 'foregroundSecondary',
})``;
