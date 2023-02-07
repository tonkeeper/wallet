import styled, { RADIUS } from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Divider = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  width: ${ns(2)}px;
  height: ${ns(36)}px;
  border-radius: ${ns(2)}px;
  margin: 0 ${ns(4)}px 0 ${ns(16)}px;
`;

export const Touchable = styled(Highlight)`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  overflow: hidden;
  position: relative;
`;

export const InfoContainer = styled.View`
  padding: ${ns(8)}px ${ns(10)}px ${ns(8)}px ${ns(12)}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Name = styled(Text).attrs({ variant: 'label3' })``;

export const Dot = styled.View<{ color: string }>`
  width: ${ns(12)}px;
  height: ${ns(12)}px;
  border-radius: ${ns(6)}px;
  background: ${({ color }) => color};
`;

export const SelectedIconContainer = styled(Animated.View)`
  position: absolute;
  top: ${ns(8)}px;
  right: ${ns(8)}px;
`;
