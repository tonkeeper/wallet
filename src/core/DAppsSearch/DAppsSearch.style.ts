import { LargeNavBarHeight } from '$shared/constants';
import styled from '$styled';
import { hNs } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Content = styled.View`
  flex: 1;
`;

export const SearchBarContainer = styled.View<{ bottomInset: number }>`
  margin-bottom: ${({ bottomInset }) => bottomInset}px;
`;

export const EmptyContainer = styled(Animated.View)`
  /* background: red; */
  margin-top: -${hNs(LargeNavBarHeight)}px;
  padding-top: ${hNs(LargeNavBarHeight)}px;
  align-items: center;
  justify-content: center;
`;
