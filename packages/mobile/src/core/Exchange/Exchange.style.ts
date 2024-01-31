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
`;
