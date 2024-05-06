import { Image, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';

import styled, { css } from '$styled';
import { deviceWidth, ns } from '$utils';
import { IsTablet, Opacity, TabletMaxWidth } from '$shared/constants';
import { isAndroid } from '@tonkeeper/uikit';

const BorderHorizontalWidth = ns(56);
const RectSize =
  (IsTablet ? TabletMaxWidth / 1.5 : deviceWidth) - BorderHorizontalWidth * 2;

export const Wrap = styled.View`
  flex: 1;
  background: #000;
`;

export const OverlayContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`;

export const MaskOverlay = styled.View`
  flex: 1;
  background-color: #000;
  opacity: 0.72;
`;

export const MaskOuter = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-around;
`;

export const MaskInner = styled.View`
  background-color: transparent;
  width: ${RectSize}px;
  height: ${RectSize}px;
`;

export const MaskRow = styled(MaskOverlay)`
  width: 100%;
`;

export const MaskCenter = styled.View`
  display: flex;
  flex-direction: row;
  height: ${RectSize}px;
`;

export const PseudoRect = styled.View`
  width: ${RectSize}px;
  height: ${RectSize}px;
`;

export const Rect = styled.View`
  position: absolute;
  z-index: 3;
  width: ${RectSize}px;
  height: ${RectSize}px;
  background: transparent;
  border-radius: ${ns(8)}px;
`;

const Corner = styled.View`
  position: absolute;
  width: ${ns(24)}px;
  height: ${ns(24)}px;
`;

export const CornerImage = styled(Image).attrs({
  source: require('$assets/qr_corner.png'),
})`
  position: absolute;
  top: ${ns(-14)}px;
  left: ${ns(-18)}px;
  width: ${ns(60)}px;
  height: ${ns(60)}px;
  z-index: 2;
`;

export const CornerHelper = styled.View`
  width: ${ns(3)}px;
  height: ${ns(3)}px;
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 1;
  border-color: rgba(0, 0, 0, 0.72);
  border-top-width: ${ns(3)}px;
  border-left-width: ${ns(3)}px;
`;

export const LeftTopCorner = styled(Corner)`
  top: 0px;
  left: 0px;
`;

export const RightTopCorner = styled(Corner)`
  top: 0px;
  right: 0px;
  transform: rotate(90deg);
`;

export const RightBottomCorner = styled(Corner)`
  bottom: 0px;
  right: 0px;
  transform: rotate(180deg);
`;

export const LeftBottomCorner = styled(Corner)`
  bottom: 0px;
  left: 0px;
  transform: rotate(270deg);
`;

export const TitleWrapper = styled.View`
  height: ${ns(32)}px;
  margin-top: ${ns(32)}px;
  margin-bottom: ${ns(32)}px;
  z-index: 3;
`;

export const FlashlightButton = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForLarge,
})`
  margin-top: ${ns(32)}px;
  z-index: 3;
`;

const FlashlightButtonContStyle = css`
  width: ${ns(56)}px;
  height: ${ns(56)}px;
  border-radius: ${ns(56 / 2)}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

export const FlashlightButtonContBlur = styled.View`
  ${FlashlightButtonContStyle};
  background: rgba(255, 255, 255, 0.08);
`;

export const BlurNode = styled(BlurView).attrs({
  tint: 'dark',
  intensity: 100,
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

export const FlashlightButtonCont = styled.View`
  ${FlashlightButtonContStyle};
  background: #fff;
`;

export const CloseButtonWrap = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForLarge,
})`
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  position: absolute;
  left: 0;
  top: ${isAndroid ? StatusBar.currentHeight : 0}px;
  z-index: 3;
  align-items: center;
  justify-content: center;
`;

export const CloseButton = styled.View`
  background: rgba(255, 255, 255, 0.08);
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

export const ErrorWrap = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const ErrorContent = styled.View`
  flex 1;
  padding-horizontal: ${ns(32)}px;
  align-items: center;
  justify-content: center;
`;

export const ErrorTextWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;
