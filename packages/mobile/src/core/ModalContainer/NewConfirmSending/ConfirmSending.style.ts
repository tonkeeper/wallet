import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Container = styled.View`
  padding-horizontal: 16px;
`;

export const Center = styled.View`
  align-items: center;
`;

export const LogoContainer = styled.View`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  border-radius: ${ns(18)}px;
  overflow: hidden;
  margin-top: ${ns(48)}px;
  margin-bottom: ${ns(20)}px;
`;

export const Logo = styled.Image`
  width: 100%;
  height: 100%;
`;

export const Title = styled(Text).attrs({ variant: 'h3' })`
  margin-bottom: ${ns(24)}px;
  text-align: center;
`;

export const Info = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
  margin-bottom: ${ns(16)}px;
`;

export const InfoItem = styled.View`
  padding: ${ns(16)}px;
  flex-direction: row;
  overflow: hidden;
`;

export const InfoItemLabel = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})``;

export const InfoItemValueText = styled(Text).attrs({
  variant: 'body1',
  textAlign: 'right',
})`
  flex: 1;
  margin-left: ${ns(16)}px;
`;
