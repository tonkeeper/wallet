import styled, { RADIUS } from '$styled';
import { hNs, nfs, ns } from '$utils';
import FastImage from 'react-native-fast-image';

export const Wrap = styled.View`
  justify-content: space-between;
  flex: 1;
  margin: 0 ${hNs(32)}px 0 ${hNs(32)}px;
`;

export const ButtonWrap = styled.View`
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
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

export const ImagesFirstContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${ns(8)}px;
`;

export const ImagesSecondContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${ns(32)}px;
`;

export const Cont = styled.View`
  z-index: 2;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const TextCont = styled.View`
  align-items: center;
`;

export const TitleWrapper = styled.View`
  margin-bottom: ${ns(8)}px;
`;

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
  priority: FastImage.priority.high,
})<{ isLast?: boolean }>`
  width: ${ns(56)}px;
  height: ${hNs(56)}px;
  border-radius: ${ns(12)}px;
  margin-right: ${({ isLast }) => ns(isLast ? 0 : 8)}px;
`;
