import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const SubscriptionInner = styled.View`
  flex-direction: row;
  align-items: center;
  height: ${ns(78)}px;
  padding-horizontal: ${ns(16)}px;
`;

export const SubscriptionCont = styled.View`
  flex: 1;
`;

export const SubscriptionInfoWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;
