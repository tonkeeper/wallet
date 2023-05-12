import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

const ICON_SIZE = ns(96);

export const Container = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Content = styled.View`
  padding: 0 ${ns(16)}px;
`;

export const Table = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const Item = styled.View`
  padding: ${ns(16)}px;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
`;

export const ItemLabel = styled(Text).attrs({
  color: 'foregroundSecondary',
  variant: 'body1',
})``;

export const ItemContent = styled.View`
  flex: 1;
  padding-left: ${ns(16)}px;
`;

export const ItemValue = styled(Text).attrs({
  variant: 'label1',
  textAlign: 'right',
  numberOfLines: 1,
})``;

export const ItemSubValue = styled(Text).attrs({
  variant: 'body2',
  color: 'foregroundSecondary',
  textAlign: 'right',
})``;

export const FooterContainer = styled.View<{ bottomInset: number }>`
  padding-bottom: ${({ bottomInset }) => bottomInset}px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const Center = styled.View`
  align-items: center;
`;

export const IconContainer = styled.View`
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  border-radius: ${ns(ICON_SIZE)}px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundQuaternary};
`;

export const WarningContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(16)}px;
  overflow: hidden;
`;

export const WarningTouchable = styled(Highlight).attrs({ useRNGHComponent: true })`
  position: relative;
`;

export const WarningContent = styled.View`
  padding: ${ns(12)}px ${ns(16)}px;
`;

export const WarningRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const WarningIcon = styled.View`
  margin-top: ${ns(2)}px;
`;
