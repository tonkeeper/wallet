import { ns } from "$utils";
import styled from '$styled';

export const Container = styled.View`
  margin-horizontal: ${ns(16)}px;
  padding-top: ${ns(20)}px;
  padding-horizontal: ${ns(24)}px;
  padding-bottom: ${ns(24)}px;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;