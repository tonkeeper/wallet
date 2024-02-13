import { RouteProp } from '@react-navigation/native';
import {
  CreateWalletStackParamList,
  CreateWalletStackRouteNames,
} from '$navigation/CreateWalletStack/types';

export interface SetupBiometryProps {
  route: RouteProp<CreateWalletStackParamList, CreateWalletStackRouteNames.Biometry>;
}
