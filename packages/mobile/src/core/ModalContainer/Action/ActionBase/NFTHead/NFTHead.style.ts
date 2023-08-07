import styled, { RADIUS } from '$styled';
import { hNs, ns } from '$utils';
import FastImage from 'react-native-fast-image';

export const NameWrapper = styled.View`
  margin-bottom: ${ns(2)}px;
`;

export const Wrap = styled.TouchableOpacity`
  align-items: center;
`;

export const CollectionWrapper = styled.View`
  margin-bottom: ${ns(2)}px;
  flex-direction: row;
  align-items: center;
`;

export const Image = styled(FastImage).attrs({
  resizeMode: 'stretch',
})`
  margin-top: ${ns(16)}px;
  z-index: 2;
  height: ${ns(96)}px;
  width: ${hNs(96)}px;
  border-radius: ${ns(RADIUS.large)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-bottom: ${ns(20)}px;
`;

export const DNSBackground = styled.View`
  align-items: center;
  justify-content: center;
  height: ${ns(96)}px;
  width: ${hNs(96)}px;
  border-radius: ${ns(RADIUS.large)}px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  margin-bottom: ${ns(20)}px;
`;