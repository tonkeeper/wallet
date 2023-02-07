import styled from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';
import WebView from 'react-native-webview';

export const Container = styled.View`
  flex: 1;
`;

export const DAppContainer = styled.View`
  flex: 1;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

export const DAppWebView = styled(WebView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

export const LoadingBar = styled(Animated.View).attrs({ pointerEvents: 'none' })`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${ns(3)}px;
  background-color: ${({ theme }) => theme.colors.accentPrimary};
`;

export const ErrorContainer = styled.View`
  flex: 1;
`;
