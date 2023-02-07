import { RouteProp } from '@react-navigation/native';
import { MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';

export interface JettonProps {
  route: RouteProp<MainStackParamList, MainStackRouteNames.Jetton>;
}
