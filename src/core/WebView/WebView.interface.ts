import { RouteProp } from '@react-navigation/native';

import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';

export interface WebViewProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.WebView>;
}
