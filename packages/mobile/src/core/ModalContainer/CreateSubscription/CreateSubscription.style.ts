import styled from '$styled';
import { nfs, ns } from '$utils';
import FastImage from 'react-native-fast-image';

export const LoaderWrap = styled.View`
  height: ${ns(336 + 56 - 10.5 - 32)}px;
  align-items: center;
  justify-content: center;
`;

export const Header = styled.View`
  align-items: center;
  padding-top: ${ns(48)}px;
`;

export const MerchantPhoto = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${ns(96)}px;
  height: ${ns(96)}px;
  border-radius: ${ns(96 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const ButtonWrap = styled.View`
  margin-top: ${ns(16)}px;
  flex: 0 0 auto;
`;

export const ButtonSending = styled.View`
  align-items: center;
  justify-content: center;
  height: ${ns(56)}px;
`;

export const SuccessWrap = styled.View`
  align-items: center;
  justify-content: center;
  height: ${ns(56)}px;
`;

export const SuccessLabelWrapper = styled.View`
  margin-top: ${ns(6)}px;
`;
