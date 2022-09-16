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
  margin-bottom: ${ns(16)}px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.font.semiBold};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  font-size: ${nfs(24)}px;
  line-height: 32px;
  text-align: center;
`;

export const Caption = styled.Text`
  font-family: ${({ theme }) => theme.font.medium};
  color: ${({ theme }) => theme.colors.foregroundSecondary};
  font-size: ${nfs(16)}px;
  line-height: 24px;
  margin-top: ${ns(4)}px;
  text-align: center;
`;

export const Footer = styled.View`
  flex: 0 0 auto;
  padding-top: ${ns(16)}px;
`;
