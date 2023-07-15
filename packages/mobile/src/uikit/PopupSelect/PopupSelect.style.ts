import Animated from 'react-native-reanimated';

import styled from '$styled';
import { ns } from '$utils';
import { AnchorPosition } from './usePopupAnimation';

const getWrapperAlign = (anchor: AnchorPosition) => {
  if (anchor === 'top-center') {
    return 'center';
  }
  if (anchor === 'top-left') {
    return 'flex-start';
  }

  return 'flex-end';
};

export const Overlay = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  flex: 1;
`;

export const Wrap = styled(Animated.View)<{ anchor: AnchorPosition }>`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  flex: 0 0 auto;
  align-self: ${({ anchor }) => getWrapperAlign(anchor)};
  margin-horizontal: ${ns(16)}px;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  box-shadow: 0px ${ns(8)}px ${ns(32)}px rgba(0, 0, 0, 0.16);
  width: ${ns(160)}px;
`;

export const Content = styled.View`
  overflow: hidden;
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
`;

export const Item = styled.View`
  height: ${ns(48)}px;
  flex-direction: row;
  align-items: center;
`;

export const ItemCont = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${ns(16)}px;
`;

export const ItemIconWrap = styled.View`
  width: ${ns(16)}px;
  position: absolute;
  right: ${ns(16)}px;
  top: 0;
  bottom: 0;
  justify-content: center;
`;
