import styled from '$styled';
import { Button } from '$uikit';
import { ns } from '$utils';

export const Wrap = styled.View`
  padding: 0 ${ns(16)}px ${ns(32)}px ${ns(16)}px;
`;

export const Buttons = styled.View`
  padding-horizontal: ${ns(16)}px;
  flex-direction: row;
`;

export const ButtonsSpacer = styled.View`
  width: ${ns(16)}px;
`;

export const FlexButton = styled(Button)`
  flex: 1;
`;

export const AddressContainer = styled.View`
  margin-top: ${ns(16)}px;
`;

export const Address = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  padding: ${ns(16)}px;
`;
