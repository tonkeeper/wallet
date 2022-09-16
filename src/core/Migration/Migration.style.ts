import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled(SafeAreaView)`
  flex: 1;
  padding: ${ns(32)}px;
`;

export const Header = styled.View`
  flex: 0 0 auto;
  padding-bottom: ${ns(16)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Footer = styled.View`
  flex: 0 0 auto;
  padding-top: ${ns(36)}px;
`;

export const CardsWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Cards = styled.View`
  flex: 0 0 auto;
  width: ${ns(250)}px;
  height: ${ns(190)}px;
  position: relative;
`;

export const Step = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const StateWrap = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${ns(32)}px;
`;

export const StateIcon = styled(Animated.View)`
  width: ${ns(84)}px;
  height: ${ns(84)}px;
`;

export const StateTitleWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;
