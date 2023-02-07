import { RouteProp } from '@react-navigation/native';
import { TabsStackRouteNames } from '$navigation';
import { TabStackParamList } from '$navigation/MainStack/TabStack/TabStack.interface';

export interface NFTsProps {
  route: RouteProp<TabStackParamList, TabsStackRouteNames.NFT>;
}
