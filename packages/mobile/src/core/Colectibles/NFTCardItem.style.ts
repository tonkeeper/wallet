import styled, { RADIUS } from '$styled';
import { ns } from '$utils';
import FastImage from 'react-native-fast-image';
import { Highlight } from '$uikit';
import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;
export const NUM_OF_COLUMNS = Math.trunc(Math.max(2, Math.min(deviceWidth / 171, 3)));
const availableWidth = NUM_OF_COLUMNS === 2 ? (deviceWidth - ns(48)) / 2 : 171; // Padding and margin between NFTs

export const Wrap = styled.View<{ withMargin: boolean }>`
  width: ${availableWidth}px;
  margin-right: ${({ withMargin }) => (withMargin ? ns(16) : 0)}px;
  margin-bottom: ${ns(16)}px;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Pressable = styled(Highlight)`
  border-radius: ${ns(RADIUS.normal)}px;
`;

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  position: relative;
  z-index: 2;
  width: 100%;
  height: ${ns(171)}px;
  border-top-left-radius: ${ns(RADIUS.normal)}px;
  border-top-right-radius: ${ns(RADIUS.normal)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
`;

export const Badges = styled.View`
  position: absolute;
  bottom: ${8}px;
  right: ${8}px;
  flex-direction: row;
  align-items: center;
`;

export const FireBadge = styled.View`
  position: absolute;
  bottom: ${0}px;
  right: ${0}px;
  flex-direction: row;
  align-items: center;
`;

export const OnSaleBadge = styled.View`
  position: absolute;
  top: ${0}px;
  right: ${0}px;
  flex-direction: row;
  align-items: center;
`;

export const AppearanceBadge = styled.View`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  align-items: center;
  justify-content: center;
`;
