import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';
import { TouchableOpacity } from 'react-native';

export const Touchable = styled(TouchableOpacity).attrs({
  activeOpacity: 0.6,
})``;

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const IconTouchable = styled(TouchableOpacity).attrs({
  activeOpacity: 0.6,
  hitSlop: { left: 16, top: 16, right: 16, bottom: 16 },
})`
  margin: 0 ${ns(8)}px 0 ${ns(16)}px;
`;

export const InfoContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: ${ns(6)}px 0;
`;

export const Label = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})`
  margin-right: ${ns(8)}px;
`;

export const Title = styled(Text).attrs({
  variant: 'body1',
})<{ width: number }>`
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  width: ${({ width }) => (width ? width + 'px' : 'auto')};
`;

export const SubTitle = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})`
  margin-left: ${ns(8)}px;
`;
