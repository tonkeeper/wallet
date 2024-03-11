import { useExternalState } from '../../hooks/useExternalState';
import { useWallet } from '../../hooks';
import { ActivityListState } from '@tonkeeper/mobile/src/wallet/Activity/ActivityList';

export const useActivityList = (): ActivityListState => {
  const wallet = useWallet();
  const state = useExternalState<ActivityListState>(wallet.activityList.state);

  return state;
};
