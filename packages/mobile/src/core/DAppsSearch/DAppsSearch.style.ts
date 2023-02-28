import { IsTablet, LargeNavBarHeight, TabletMaxWidth } from '$shared/constants';
import styled, { css } from '$styled';
import { hNs, isIOS, ns } from '$utils';
import { KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';

export const Responder = styled(TouchableWithoutFeedback)`
  width: 100%;
  height: 100%;
  align-items: center;
`;

export const Container = styled.View<{ bottomInset: number }>`
  flex: 1;
  padding-bottom: ${({ bottomInset }) => bottomInset}px;
`;

export const KeyboardAvoidView = styled(KeyboardAvoidingView).attrs({
  behavior: 'padding',
  enabled: isIOS,
})`
  flex: 1;
  max-height: 100%;
  position: relative;
  ${() =>
    IsTablet &&
    css`
      align-items: center;
    `}
`;

// Special width for tablets or big devices
export const Content = styled.View`
  ${() =>
    IsTablet &&
    css`
      width: ${TabletMaxWidth}px;
    `}
  flex: 1;
`;

export const SearchBarWrapper = styled.View`
  ${() =>
    IsTablet &&
    css`
      align-items: center;
    `}
`;

// Special width for tablets or big devices
export const SearchBarContent = styled.View`
  width: ${IsTablet ? `${TabletMaxWidth}px` : '100%'};
`;

export const EmptyContainer = styled(Animated.View)`
  margin-top: -${hNs(LargeNavBarHeight)}px;
  padding-top: ${hNs(LargeNavBarHeight)}px;
  align-items: center;
  justify-content: center;
`;

export const NavBarButtonContainer = styled.View`
  padding-right: ${ns(16)}px;
`;
