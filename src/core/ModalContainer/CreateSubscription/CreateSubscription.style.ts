import styled from '$styled';
import { nfs, ns } from '$utils';
import FastImage from 'react-native-fast-image';

export const LoaderWrap = styled.View`
  height: ${ns(336 + 56 - 10.5 - 32)}px;
  align-items: center;
  justify-content: center;
`;

export const Header = styled.View`
  flex-direction: row;
  padding: ${ns(0)}px ${ns(16)}px ${ns(32)}px;
`;

export const MerchantPhoto = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  border-radius: ${ns(72 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const MerchantInfoWrap = styled.View`
  margin-left: ${ns(16)}px;
  flex: 1;
  align-items: flex-start;
`;

export const MerchantInfo = styled.View`
  height: ${ns(72)}px;
  justify-content: center;
`;

export const ProductNameWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;

export const Content = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const ButtonWrap = styled.View`
  margin-top: ${ns(32)}px;
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
