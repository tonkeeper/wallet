import styled from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

const iconArrow = require('./icon-arrow.png');

export const Touchable = styled.TouchableWithoutFeedback``;

export const Container = styled(Animated.View)`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  width: ${ns(40)}px;
  height: ${ns(40)}px;
  border-radius: ${ns(40)}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  overflow: hidden;
`;

export const LeftArrow = styled(Animated.Image).attrs({ source: iconArrow })``;
export const RightArrow = styled(Animated.Image).attrs({ source: iconArrow })``;
