import styled from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const TopTabsHeight = ns(64);

export const Container = styled.View`
  width: 100%;
  height: ${TopTabsHeight}px;
  padding: 0 ${ns(8)}px;
  flex-direction: row;
  position: relative;
`;

export const TabItem = styled.TouchableOpacity`
  padding: 0 ${ns(16)}px;
  padding-top: ${ns(16)}px;
`;

export const Indicator = styled(Animated.View)`
  position: absolute;
  bottom: ${ns(16)}px;
  width: ${ns(24)}px;
  height: ${ns(3)}px;
  border-radius: ${ns(3)}px;
  background: ${({ theme }) => theme.colors.accentPrimary};
`;
