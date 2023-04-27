import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Content = styled.View`
  padding: 0 ${ns(16)}px;
`;

export const InputContainer = styled.View`
  height: ${ns(208)}px;
`;

export const TitleContainer = styled.View`
  padding: ${ns(12)}px 0;
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
})`
  flex: 1;
`;

export const ItemContent = styled.View`
  align-items: flex-end;
`;

export const ItemValue = styled(Text).attrs({
  variant: 'label1',
})``;

export const ItemSubValue = styled(Text).attrs({
  variant: 'body2',
  color: 'foregroundSecondary',
})``;
