import styled from '$styled';
import { deviceHeight, nfs, ns } from '$utils';
import { Opacity } from '$shared/constants';
import {Text} from "$uikit/Text/Text";

export const Wrap = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

export const DismissOverlay = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

export const Content = styled.View`
  flex: 0 0 auto;
  z-index: 2;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  border-top-left-radius: ${({ theme }) => ns(theme.radius.large)}px;
  border-top-right-radius: ${({ theme }) => ns(theme.radius.large)}px;
  position: relative;
  max-height: ${deviceHeight * 0.85}px;
`;

export const Header = styled.View`
  flex-direction: row;
  height: ${ns(64)}px;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
`;

export const HeaderTitle = styled(Text).attrs({ variant: 'h3' })`
  padding: 0 ${ns(16)}px;
`;

export const HeaderCloseButtonWrap = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
`;

export const HeaderCloseButton = styled.View`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;
