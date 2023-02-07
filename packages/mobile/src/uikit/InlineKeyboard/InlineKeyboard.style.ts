import Animated from 'react-native-reanimated';

import styled from '$styled';
import { nfs, ns } from '$utils';
import {Text} from "$uikit/Text/Text";

export const Wrap = styled.View`
  padding: ${ns(8.5)}px;
`;

export const Line = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

export const Key = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  position: relative;
`;

export const KeyCircle = styled(Animated.View)`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  border-radius: ${ns(72 / 2)}px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const KeyContent = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

export const KeyLabel = styled(Text).attrs({ variant: 'h1' })``;
