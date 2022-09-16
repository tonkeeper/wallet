import LottieView from 'lottie-react-native';
import styled from '$styled';
import { deviceHeight, deviceWidth, ns } from '$utils';

const confettiWidth = deviceHeight * 0.5625;

export const AnimationWrap = styled.View`
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: ${(deviceWidth - confettiWidth) / 2}px;
  width: ${confettiWidth}px;
  height: ${deviceHeight}px;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(148 + 12)}px;
  height: ${ns(148 + 12)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(0)}px;
`;
