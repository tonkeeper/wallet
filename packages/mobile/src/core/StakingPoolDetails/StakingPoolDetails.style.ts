import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { deviceWidth, ns } from '$utils';

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

export const BalanceTouchableContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(16)}px;
  position: relative;
  overflow: hidden;
`;

export const BalanceTouchable = styled(Highlight).attrs({ useRNGHComponent: true })``;

export const BalanceTouchableContent = styled.View`
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
})``;

export const ItemValue = styled(Text).attrs({
  variant: 'body2',
})`
  margin-left: ${ns(10)}px;
  text-align: right;
  flex: 1;
`;

export const TitleContainer = styled.View`
  padding: ${ns(14)}px 0;
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Flex = styled.View`
  flex: 1;
`;

export const DetailsButtonContainer = styled.View`
  align-items: center;
`;

export const HeaderWrap = styled.View`
  align-items: center;
`;

export const FlexRow = styled.View`
  padding-horizontal: ${ns(12)}px;
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${ns(16)}px;
  margin-bottom: ${ns(28)}px;
`;

export const JettonAmountWrapper = styled.View`
  flex: 1;
`;

export const Divider = styled.View`
  height: ${ns(0.5)}px;
  width: ${deviceWidth}px;
  background: rgba(79, 90, 112, 0.24);
`;

export const ActionsContainer = styled.View`
  justify-content: center;
  flex-direction: row;
  margin-bottom: ${ns(12)}px;
`;

export const ExploreButtons = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const ChartContainer = styled.View`
  margin: 0 -${ns(16)}px;
`;
