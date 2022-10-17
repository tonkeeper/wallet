import { Opacity } from '$shared/constants';
import styled from '$styled';
import { Highlight, Text } from '$uikit';
import { SkeletonLine } from '$uikit/Skeleton/SkeletonLine';
import { ns } from '$utils';

export const Cell = styled(Highlight)`
  position: relative;
`;

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${ns(16)}px;
  overflow: hidden;
`;

export const Content = styled.View`
  flex: 1;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const IconContainer = styled.View`
  margin-top: ${ns(2)}px;
`;

export const Title = styled(Text).attrs(() => ({
  variant: 'label1',
  numberOfLines: 1,
}))`
  margin-right: ${ns(4)}px;
  max-width: 80%;
`;

export const AddressName = styled(Text).attrs(() => ({
  variant: 'body1',
  color: 'foregroundSecondary',
}))`
  margin-left: ${ns(2)}px;
  margin-right: ${ns(4)}px;
`;

export const Domain = styled(Title).attrs({
  color: 'accentPrimary',
})``;

export const SubTitleContainer = styled.View`
  position: relative;
`;

export const SubTitle = styled(Text).attrs(() => ({
  variant: 'body2',
  color: 'foregroundSecondary',
}))<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export const SubTitleSkeleton = styled(SkeletonLine).attrs({ width: 100 })`
  position: absolute;
  top: ${ns(2)}px;
`;

export const MoreTouchable = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForLarge,
})`
  /* tap zone */
  padding: ${ns(12)}px ${ns(12)}px;
  margin: 0 ${-ns(12)}px;
`;
