import { JettonBalanceModel } from '$store/models';
import { useSelector } from 'react-redux';
import { eventsSelector } from '$store/events';
import { useMemo } from 'react';
import { compareAddresses } from '$utils';
import { ActionTypeEnum } from 'tonapi-sdk-js';

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
                  action.type === ActionTypeEnum.JettonTransfer &&
                  compareAddresses(action[action.type].jetton.address, address),
              ),
            },
          ])
          .filter(([_, event]) => event.actions.length > 0),
      ),
    [address, eventsInfo],
  );
}
