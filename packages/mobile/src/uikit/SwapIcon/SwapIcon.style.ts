import styled from '$styled';
import Animated from 'react-native-reanimated';

export const iconArrow = require('./icon-arrow.png');

export const LeftArrow = styled(Animated.Image).attrs({ source: iconArrow })``;
export const RightArrow = styled(Animated.Image).attrs({ source: iconArrow })``;
