import LottieView from 'lottie-react-native';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  align-items: center;
  padding: ${ns(32)}px;
  padding-top: ${ns(14)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${-ns(2)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Buttons = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(120)}px;
  height: ${ns(120)}px;
`;
