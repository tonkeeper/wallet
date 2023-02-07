import { RouteProp } from '@react-navigation/native';
import { MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';

export interface BackupWordsProps {
  route: RouteProp<MainStackParamList, MainStackRouteNames.BackupWords>;
}
