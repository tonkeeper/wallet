import { Opacity } from '$shared/constants';
import styled from '$styled';
import { hNs, ns } from '$utils';
import WebView from 'react-native-webview';

export const Container = styled.View`
  flex: 1;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

export const Browser = styled(WebView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  padding: 19.5px 16px;
  align-items: flex-end;
`;

export const BackButtonContainer = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})``;

export const BackButton = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  height: ${hNs(32)}px;
  width: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
`;
