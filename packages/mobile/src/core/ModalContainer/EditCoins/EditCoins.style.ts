import styled from '$styled';
import { nfs, ns } from '$utils';
import {Button, Text} from '$uikit';

export const Item = styled.View`
  flex-direction: row;
  height: ${ns(68)}px;
  align-items: center;
  padding-horizontal: ${ns(16)}px;
`;

export const ItemName = styled(Text).attrs({ variant: 'label1' })`
  margin-left: ${ns(16)}px;
  flex: 1;
`;

export const ItemButton = styled(Button)`
  margin-left: ${ns(16)}px;
  flex: 0 0 auto;
`;

export const SeparatorWrap = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const Separator = styled.View`
  height: ${ns(0.5)}px;
  background: ${({ theme }) => theme.colors.border};
  margin-left: ${ns(16)}px;
`;
