import { walletActions, walletWalletSelector } from '$store/wallet';
import { useNetInfo } from '@react-native-community/netinfo';
import { State } from '@tonkeeper/core';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// temporary fix
// TODO: Remove this hook during the "balances" refactoring.
export const useBalanceUpdater = () => {
  const wallet = useSelector(walletWalletSelector);
  const dispatch = useDispatch();

  const { isConnected } = useNetInfo();
  const prevIsConnected = useRef(isConnected);

  const isActivityReloading = useExternalState(
    tk.wallet?.activityList.state ??
      new State({
        isReloading: false,
        isLoading: false,
        hasMore: true,
        sections: [],
        error: null,
      }),
    (s) => s.isReloading,
  );

  useEffect(() => {
    if (!wallet) {
      return;
    }

    if (isActivityReloading || (isConnected && prevIsConnected.current === false)) {
      dispatch(walletActions.refreshBalancesPage(false));
    }
  }, [dispatch, isActivityReloading, isConnected, wallet]);
};
