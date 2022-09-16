import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';

export interface NFTProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.NFT>;
}
