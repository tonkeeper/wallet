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
  padding: ${ns(8)}px 0;
  overflow: hidden;
`;

export const Item = styled.View`
  padding: ${ns(8)}px ${ns(16)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
`;

export const ItemLabel = styled(Text).attrs({
  color: 'foregroundSecondary',
  variant: 'body2',
})`
  flex: 1;
`;

export const ItemContent = styled.View`
  align-items: flex-end;
`;

export const ItemValue = styled(Text).attrs({
  variant: 'body2',
})``;
