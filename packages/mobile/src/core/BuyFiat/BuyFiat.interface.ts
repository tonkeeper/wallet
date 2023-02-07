import { RouteProp } from '@react-navigation/native';

import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';

export interface BuyFiatProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.BuyFiat>;
}
