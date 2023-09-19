import Webview from 'react-native-webview';

import styled from '$styled';
import { Opacity } from '$shared/constants';
import { hNs, ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

export const Browser = styled(Webview)`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  z-index: 1;
`;

export const LoaderWrap = styled.View`
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const CloseButtonWrap = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  height: ${ns(64)}px;
  width: ${ns(64)}px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  z-index: 2;
`;

export const CloseButton = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  height: ${ns(32)}px;
  width: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
`;
