import { APPS_ITEMS_IN_ROW } from '$core/DAppsExplore/constants';
import { IsTablet, TabletMaxWidth } from '$shared/constants';
import styled, { RADIUS } from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';
import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

const deviceWidth = IsTablet ? TabletMaxWidth : Dimensions.get('window').width;

const ICON_SIZE = ns(64);

const LIST_WIDTH = deviceWidth - ns(12) * 2;

const MARGIN_BETWEEN = ns(4);

const ITEM_WIDTH =
  (LIST_WIDTH - MARGIN_BETWEEN * (APPS_ITEMS_IN_ROW - 1)) / APPS_ITEMS_IN_ROW;

export const Container = styled.View<{ withoutMargin: boolean }>`
  align-items: center;
  padding: ${ns(8)}px 0;
  margin-right: ${({ withoutMargin }) => (withoutMargin ? 0 : MARGIN_BETWEEN)}px;
  margin-bottom: ${ns(8)}px;
  width: ${ITEM_WIDTH}px;
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
