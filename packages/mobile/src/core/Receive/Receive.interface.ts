import { RouteProp } from '@react-navigation/native';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';

export interface ReceiveProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.Receive>;
}
