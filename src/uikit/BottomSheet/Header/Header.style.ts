import styled from '$styled';
import { nfs, ns } from '$utils';
import { Opacity } from '$shared/constants';
import {Text} from "$uikit/Text/Text";

export const Container = styled.View`
  /* Hack, because react-native-reanimated-bottom-sheet add border for content */
  margin-bottom: -1px;
`;

export const TopSection = styled.View`
  width: 100%;
  height: ${ns(24)}px;
  justify-content: center;
  align-items: center;
`;

export const SwipePanel = styled.View`
  width: ${ns(56)}px;
  height: ${ns(4)}px;
  border-radius: 100px;
  opacity: 0.48;
  background-color: ${({ theme }) => theme.colors.constantLight};
`;

export const Header = styled.View`
  flex-direction: row;
  height: ${ns(64)}px;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};
  border-top-left-radius: ${({ theme }) => ns(theme.radius.large)}px;
  border-top-right-radius: ${({ theme }) => ns(theme.radius.large)}px;
  flex: 0 0 auto;
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
