import LottieView from 'lottie-react-native';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.SafeAreaView`
  flex: 1;
`;

export const Info = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${ns(32)}px;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(120)}px;
  height: ${ns(120)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Footer = styled.View`
  flex: 0 0 auto;
  padding: ${ns(32)}px;
`;
