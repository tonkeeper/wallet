import { RouteProp } from '@react-navigation/native';

import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';

export interface MigrationProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.Migration>;
}
