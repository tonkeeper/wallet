import { EventsMap } from '$store/events/interface';
import { Action } from '@tonkeeper/core';

const seeIfTonTransfer = (action: Action) => {
  if (action.type === 'TonTransfer') {
    return true;
  } else if (action.type === 'ContractDeploy') {
    if (action.contractDeploy?.interfaces?.includes('wallet')) {
      return true;
    }
  }
  return false;
};

export const groupAndFilterTonActivityItems = (data: EventsMap) => {
  const eventsMap = {} as EventsMap;

  Object.entries(data).forEach(([key, event]) => {
    const tonTransferEvent = event.actions.every(seeIfTonTransfer);
    if (tonTransferEvent) {
      eventsMap[key] = event;
    }
  });
  return eventsMap;
};
