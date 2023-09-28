import styled, { RADIUS } from '$styled';
import Animated from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import FastImage from 'react-native-fast-image';
import RNVideo from 'react-native-video';
import { ns } from '$utils';
import { TouchableOpacity } from 'react-native';

export const Wrap = styled(Animated.View)`
  flex: 1;
  margin-bottom: ${ns(16)}px;
`;

export const MediaContainer = styled.View<{ height: number }>`
  z-index: 2;
  width: 100%;
  height: ${(props) => props.height}px;
  border-top-left-radius: ${ns(RADIUS.normal)}px;
  border-top-right-radius: ${ns(RADIUS.normal)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
`;

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  flex: 1;
`;

export const Lottie = styled(LottieView).attrs({
  resizeMode: 'cover',
})`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
`;

export const Video = styled(RNVideo).attrs({
  resizeMode: 'cover',
  posterResizeMode: 'cover',
})`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
`;

export const TextWrap = styled.View`
  z-index: 2;
  padding: ${ns(14)}px ${ns(16)}px ${ns(16)}px ${ns(16)}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TitleWrap = styled(TouchableOpacity).attrs({
  activeOpacity: 0.6,
})`
  margin-bottom: ${ns(8)}px;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const CollectionWrapper = styled.View`
  margin-right: ${ns(4)}px;
`;

export const DescriptionWrap = styled.View`
  margin-top: ${ns(8)}px;
`;
