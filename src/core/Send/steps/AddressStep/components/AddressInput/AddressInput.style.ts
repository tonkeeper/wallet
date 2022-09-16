import styled from '$styled';
import { isAndroid, ns } from '$utils';
import Animated from 'react-native-reanimated';

export const INPUT_HEIGHT = ns(56);

export const InputContainer = styled.View`
  position: relative;
  margin-top: -${ns(8)}px;
`;

export const ScanQRContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
`;

export const ScanQRTouchable = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: 0 ${ns(14)}px;
`;

export const LoaderContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  padding: 0 ${ns(14)}px;
`;

export const InfoContainer = styled(Animated.View)`
  position: absolute;
  left: ${ns(isAndroid ? 20 : 16)}px;
  top: 0;
  bottom: 0;
  justify-content: center;
  padding: 0 ${ns(8)}px;
`;
