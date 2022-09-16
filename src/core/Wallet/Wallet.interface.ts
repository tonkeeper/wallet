import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '$navigation/MainStack';
import { MainStackRouteNames } from '$navigation';

export interface WalletProps {
  route: RouteProp<MainStackParamList, MainStackRouteNames.Wallet>;
}
