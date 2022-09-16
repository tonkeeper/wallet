import { ActionType, JettonBalanceModel } from '$store/models';
import { useSelector } from 'react-redux';
import { eventsSelector } from '$store/events';
import { useMemo } from 'react';
import { compareAddresses } from '$utils';

export function useJettonEvents(address: JettonBalanceModel['walletAddress']) {
  const { eventsInfo } = useSelector(eventsSelector);

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(eventsInfo)
          .map(([_, event]) => [
            _,
            {
              ...event,
              actions: event.actions.filter(
                (action) =>
                  ActionType[action.type] === ActionType.JettonTransfer &&
                  compareAddresses(
                    action[ActionType[action.type]].jetton.address,
                    address,
                  ),
              ),
            },
          ])
          .filter(([_, event]) => event.actions.length > 0),
      ),
    [address, eventsInfo],
  );
}
