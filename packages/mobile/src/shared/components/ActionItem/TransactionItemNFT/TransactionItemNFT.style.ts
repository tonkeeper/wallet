import styled, { RADIUS } from '$styled';
import { hNs, ns } from '$utils';
import FastImage from 'react-native-fast-image';
import { Highlight, Icon } from '$uikit';

export const Wrap = styled.View`
  margin-top: ${ns(8)}px;
`;

export const Background = styled.View<{ withImage: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  ${({ withImage }) =>
    !withImage
      ? `
        border-top-left-radius: ${ns(RADIUS.normal)}px;
        border-bottom-left-radius: ${ns(RADIUS.normal)}px;
      `
      : ''}
  border-top-right-radius: ${ns(RADIUS.normal)}px;
  border-bottom-right-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const TextWrap = styled.View`
  justify-content: center;
  z-index: 2;
  padding: ${ns(12)}px ${ns(12)}px ${ns(8)}px ${ns(12)}px;
  height: ${ns(64)}px;
`;

export const TextContainer = styled.View`
  align-items: flex-start;
  flex: 1;
`;

export const Container = styled.View`
  flex-direction: row;
`;

export const Pressable = styled(Highlight)`
  border-radius: ${ns(RADIUS.normal)}px;
`;

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  z-index: 2;
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  border-bottom-left-radius: ${ns(RADIUS.normal)}px;
  border-top-left-radius: ${ns(RADIUS.normal)}px;
  background: ${({ theme }) => theme.colors.backgroundQuaternary};
`;

export const GlobeIcon = styled(Icon).attrs({
  size: 64,
  name: 'globe-96',
  colorless: true,
  imageStyle: {
    borderBottomLeftRadius: ns(RADIUS.normal),
    borderTopLeftRadius: ns(RADIUS.normal),
  },
})``;

export const CollectionNameWrap = styled.View<{ withIcon?: boolean }>`
  flex-direction: row;
  align-items: center;
  flex: 1;
  padding-right: ${({ withIcon }) => (!withIcon ? 0 : ns(12))}px;
`;
