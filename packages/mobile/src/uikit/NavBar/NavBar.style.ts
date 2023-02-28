import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';

import styled, { css } from '$styled';
import { ns, hNs } from '$utils';
import { IsTablet, NavBarHeight, Opacity, TabletMaxWidth } from '$shared/constants';
import { Text } from '$uikit/Text/Text';

export const Wrap = styled.View<{ isTransparent: boolean }>`
  z-index: 10;
  ${({ isTransparent }) => {
    if (isTransparent) {
      return `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      `;
    } else {
      return 'position: relative;';
    }
  }}
`;

export const Gradient = styled(LinearGradient)`
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export const Cont = styled(Animated.View)`
  height: ${hNs(NavBarHeight - 0.5)}px;
  z-index: 2;
  border-bottom-width: ${ns(0.5)}px;
`;

export const Content = styled.View`
  flex: 1;
  flex-direction: row;
  padding-horizontal: ${ns(16)}px;
  align-items: center;
  position: relative;
`;

export const BackButtonContainer = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  height: ${hNs(NavBarHeight)}px;
  width: ${ns(NavBarHeight)}px;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  position: absolute;
  z-index: 2;
`;

export const BackButton = styled(Animated.View)`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  height: ${hNs(32)}px;
  width: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
`;

export const RightContent = styled.View`
  top: 0;
  right: 0;
  position: absolute;
  z-index: 2;
  height: ${hNs(NavBarHeight)}px;
  min-width: ${ns(NavBarHeight)}px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`;

export const Title = styled(Text).attrs(() => ({
  variant: 'h3',
  textAlign: 'center',
  reanimated: true,
}))`
  padding: 0 ${hNs(NavBarHeight)}px;
  flex: 1;
  z-index: 1;
`;
