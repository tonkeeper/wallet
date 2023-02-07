import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  margin-top: ${ns(32)}px;
  padding-horizontal: ${ns(16)}px;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.View`
  margin-bottom: ${ns(32)}px;
`;

export const IconWrap = styled.View`
  margin-bottom: ${ns(16)}px;
  align-items: center;
  justify-content: center;
`;

export const Footer = styled.View`
  padding-horizontal: ${ns(16)}px;
`;
