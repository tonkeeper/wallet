import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const Content = styled.View`
  padding: 0 ${ns(16)}px;
`;

export const BalanceContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(16)}px;
  padding: ${ns(16)}px;
  overflow: hidden;
  flex-direction: row;
  justify-content: space-between;
`;

export const BalanceRight = styled.View`
  align-items: flex-end;
`;

export const Table = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
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

export const TitleContainer = styled.View`
  padding: ${ns(12)}px 0;
`;

export const Row = styled.View`
  flex-direction: row;
`;

export const Flex = styled.View`
  flex: 1;
`;

export const DetailsButtonContainer = styled.View`
  align-items: center;
`;
