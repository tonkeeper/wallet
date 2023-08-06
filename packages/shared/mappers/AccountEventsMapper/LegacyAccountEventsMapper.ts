import { AccountEvent } from '@tonkeeper/core/src/TonAPI';

export function toLowerCaseFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function LegacyAccountEventsMapper(events: any) {
  return Object.values(events).reduce<AccountEvent[]>((acc, item: any) => {

    
    const event: AccountEvent = {
      ...item,
      event_id: item.eventId,
      account: item.account
        ? {
            ...item.account,
            is_scam: item.account.isScam,
          }
        : undefined,
      is_scam: item.isScam,
      in_progress: item.inProgress,
      actions: item.actions.map((action) => ({
        ...action,
        simple_preview: action.simplePreview,
        [action.type]: action[toLowerCaseFirstLetter(action.type)]
      }))
    };

    acc.push(event);

    return acc;
  }, []);
}
