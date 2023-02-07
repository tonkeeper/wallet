import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '$navigation/MainStack';

import { MainStackRouteNames } from '$navigation';

export interface SetupBiometryProps {
  route: RouteProp<MainStackParamList, MainStackRouteNames.SetupBiometry>;
}
