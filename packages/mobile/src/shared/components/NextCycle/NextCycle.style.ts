import styled from '$styled';
import { changeAlphaValue, convertHexToRGBA, ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(16)}px;
  padding: ${ns(16)}px;
  overflow: hidden;
  position: relative;
`;

export const ProgressView = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
