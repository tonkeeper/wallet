import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import styled from '$styled';
import { ns } from '$utils';
import { Text } from '$uikit';

export const Logos = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${ns(48)}px;
  margin-bottom: ${ns(20)}px;
`;

export const TonLogo = styled.View`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  justify-content: center;
  align-items: center;
`;

export const AddressConatiner = styled.View`
  width: ${ns(86)}px;
  height: ${ns(72)}px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const AddressGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  z-index: 1;
  width: ${ns(43)}px;
  height: ${ns(72)}px;
`;

export const AddressLeftGradient = styled(AddressGradient)`
  left: 0;
`;

export const AddressRightGradient = styled(AddressGradient)`
  right: 0;
`;

export const ADDRESS_CELL_WIDTH = 43;
export const Address = styled.View`
  flex: 1;
  width: ${ns(ADDRESS_CELL_WIDTH)}px;
  overflow: hidden;
  align-items: flex-end;
  justify-content: flex-end;
`;

export const VerticalDivider = styled.View`
  width: ${ns(2)}px;
  height: ${ns(34)}px;
  border-radius: 34px;
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
`;

export const Logo = styled.View`
  background-color: #1d2633;
  border-radius: ${({ theme }) => theme.radius.large}px;
  width: ${ns(72)}px;
  height: ${ns(72)}px;
`;

export const Picture = styled(FastImage)`
  border-radius: ${({ theme }) => theme.radius.large}px;
  width: ${ns(72)}px;
  height: ${ns(72)}px;
`;

export const Container = styled(Animated.View)`
  padding-horizontal: ${ns(16)}px;
  padding-bottom: ${ns(16)}px;
`;

export const Content = styled.View`
  padding-horizontal: ${ns(16)}px;
  margin-bottom: ${ns(24)}px;
`;

export const TitleWrapper = styled.View`
  margin-bottom: ${ns(4)}px;
`;

export const Center = styled.View<{ isTonConnectV2: boolean }>`
  height: ${({ isTonConnectV2 }) => ns(isTonConnectV2 ? 56 + 16 + 40 : 56)}px;
  justify-content: center;
  align-items: center;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(43)}px;
  height: ${ns(43)}px;

  /* Fix indents check.json lottie */
  margin-top: ${ns(-1)}px;
  margin-bottom: ${ns(-1.8)}px;
`;

export const Footer = styled.View<{ isTonConnectV2: boolean }>`
  height: ${({ isTonConnectV2 }) => ns(isTonConnectV2 ? 56 + 16 + 40 : 56)}px;
  position: relative;
`;

export const SuccessText = styled(Text).attrs(() => ({
  variant: 'label2',
  color: 'accentPositive',
}))`
  margin-top: ${ns(6)}px;
`;

export const AddressText = styled(Text).attrs(() => ({
  color: 'foregroundTertiary',
  variant: 'body2',
  reanimated: true,
}))`
  height: 24px;
`;

export const NoticeText = styled(Text).attrs(() => ({
  color: 'foregroundTertiary',
  variant: 'body2',
  textAlign: 'center',
}))`
  margin-top: ${ns(16)}px;
`;
