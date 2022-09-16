import { EventKey } from '$store/events/interface';
import { EventModel } from '$store/models';
import { useSelector } from 'react-redux';
import { eventsSelector } from '$store/events';

export function useEvent(eventKey: EventKey): EventModel {
  const { eventsInfo } = useSelector(eventsSelector);
  return eventsInfo[eventKey];
}
