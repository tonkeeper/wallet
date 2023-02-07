import FastImage from 'react-native-fast-image';

import styled from '$styled';
import { hNs, nfs, ns } from '$utils';
import { Opacity } from '$shared/constants';

export const Wrap = styled.View`
  align-items: center;
  margin-top: ${ns(48)}px;
  margin-bottom: ${ns(32)}px;
  padding-horizontal: ${ns(32)}px;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${ns(72)}px;
  height: ${hNs(72)}px;
  border-radius: ${ns(18)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(16)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Buttons = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const Links = styled.View`
  flex-direction: row;
  margin-top: ${hNs(8)}px;
`;

export const Link = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  margin-right: ${ns(12)}px;
`;

export const WarningContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  padding-horizontal: ${ns(16)}px;
  padding-vertical: ${ns(14)}px;
  margin-horizontal: ${ns(16)}px;
  margin-bottom: ${ns(32)}px;
  border-radius: 14px;
`;

export const CheckmarkContainer = styled.View`
  margin-top: ${ns(16)}px;
  align-items: center;
`;
