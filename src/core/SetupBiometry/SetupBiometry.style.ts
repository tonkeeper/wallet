import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
  padding: ${ns(32)}px;
  padding-top: 0;
`;

export const Content = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const IconWrap = styled.View`
  width: ${ns(160)}px;
  height: ${ns(160)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Footer = styled.View`
  flex: 0 0 auto;
  padding-top: ${ns(16)}px;
`;
