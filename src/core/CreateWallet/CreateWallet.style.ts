import Animated from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  flex: 1;
`;

export const Step = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const Content = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${ns(32)}px;
`;

export const Icon = styled(Animated.View)`
  width: ${ns(84)}px;
  height: ${ns(84)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const ButtonWrap = styled.View`
  padding-horizontal: ${ns(32)}px;
  height: ${ns(56)}px;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(128)}px;
  height: ${ns(128)}px;
`;
