import { RouteProp } from '@react-navigation/native';

import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';

export interface SubscriptionProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.Subscription>;
}
