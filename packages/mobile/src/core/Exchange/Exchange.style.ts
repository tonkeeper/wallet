import styled from '$styled';
import { Text } from '$uikit';
import { hNs, ns } from '$utils';

export const LoaderWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Contain = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  margin: 0 ${hNs(16)}px;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
`;

export const HeaderContainer = styled.View`
  margin: 0 ${hNs(16)}px;
`;

export const OtherWaysButtonContainer = styled.View`
  align-items: center;
  margin-top: ${ns(12)}px;
`;

export const OtherWaysButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: ${ns(10)}px ${ns(16)}px;
`;

export const OtherWaysButtonLabel = styled(Text).attrs(() => ({
  variant: 'body2',
  color: 'foregroundSecondary',
}))``;

export const TitleContainer = styled.View`
  padding: ${ns(14)}px ${ns(16)}px;
  flex-direction: row;
  gap: 6px;
`;

export const Asset = styled.View`
  width: ${ns(24)}px;
  height: ${ns(24)}px;
  border-radius: ${ns(24) / 2}px;
  border-width: ${ns(2)}px;
  border-color: ${({ theme }) => theme.colors.backgroundPrimary};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  margin-right: -${ns(8)}px;
  overflow: hidden;
`;

export const AssetsContainer = styled.View`
  flex-direction: row;
  margin-top: ${ns(2)}px;
  margin-left: ${ns(-2)}px;
`;

export const AssetImage = styled.Image`
  width: ${ns(20)}px;
  height: ${ns(20)}px;
`;

export const AssetsCount = styled.View`
  height: ${ns(20)}px;
  border-radius: ${ns(20) / 2}px;
  padding: 0 ${ns(8)}px;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-left: ${ns(12)}px;
  margin-top: ${ns(2)}px;
`;
