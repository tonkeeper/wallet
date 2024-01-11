import FastImage from 'react-native-fast-image';

import styled from '$styled';
import { hNs, ns } from '$utils';
import { Opacity } from '$shared/constants';

export const Wrap = styled.View`
  padding: 0 ${ns(16)}px ${ns(32)}px ${ns(16)}px;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${ns(76)}px;
  height: ${hNs(76)}px;
  border-radius: ${ns(16)}px;
`;

export const InputWrapper = styled.View`
  width: 100%;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Buttons = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const Links = styled.View`
  flex-direction: row;
  margin-top: ${hNs(16)}px;
  justify-content: center;
  padding-horizontal: ${ns(16)}px;
  margin-bottom: ${-hNs(16)}px;
`;

export const Link = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  padding: ${hNs(16)}px ${ns(16)}px;
`;
