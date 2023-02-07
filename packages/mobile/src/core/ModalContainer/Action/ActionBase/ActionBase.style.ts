import styled from '$styled';
import { ns } from '$utils';
import { Button, Text } from '$uikit';

export const InfoWrap = styled.View`
  padding: ${ns(16)}px;
  align-items: center;
`;

export const TypeLabelWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;

export const SpamWrap = styled.View`
  margin-bottom: ${ns(12)}px;
`;

export const SpamBadge = styled.View`
  padding: ${ns(4)}px ${ns(8)}px;
  border-radius: ${ns(8)}px;
  background: ${({ theme }) => theme.colors.accentOrange};
`;

export const Pending = styled.View`
  height: ${ns(24)}px;
  margin-top: ${ns(2)}px;
  flex-direction: row;
  align-items: center;
`;

export const PendingTextWrapper = styled.View`
  margin-left: ${ns(4)}px;
`;

export const Table = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  margin-top: ${ns(16)}px;
  overflow: hidden;
`;

export const Item = styled.View`
  padding: ${ns(16)}px;
  flex-direction: row;
  overflow: hidden;
`;

export const ItemLabel = styled(Text).attrs({
  color: 'foregroundSecondary',
  variant: 'body1',
})``;

export const ItemValue = styled(Text).attrs({
  variant: 'label1',
})`
  margin-left: ${ns(10)}px;
  text-align: right;
  flex: 1;
`;

export const SendButton = styled(Button).attrs({
  mode: 'secondary',
})`
  margin-top: ${ns(32)}px;
`;
