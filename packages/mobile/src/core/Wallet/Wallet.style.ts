import styled from '$styled';
import { ns } from '$utils';
import { Highlight } from '$uikit';

export const Wrap = styled.View`
  flex: 1;
`;

export const Info = styled.View`
  align-items: center;
  padding-horizontal: ${ns(32)}px;
`;

export const AmountWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;

export const FiatInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${ns(2)}px;
`;

export const FiatAmountWrapper = styled.View`
  margin-right: ${ns(4)}px;
`;

export const Actions = styled.View`
  margin-top: ${ns(16)}px;
  flex-direction: row;
  padding-right: ${ns(16)}px;
`;

export const Action = styled(Highlight)`
  flex: 1;
  margin-left: 16px;
  align-items: center;
  justify-content: center;
  height: ${ns(56)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const ActionLabelWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;
