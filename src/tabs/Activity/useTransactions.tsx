import { eventsSelector } from "$store/events";
import { EventModel } from "$store/models";
import { formatDate, getLocale } from "$utils";
import { differenceInCalendarMonths, format } from "date-fns";
import { useMemo } from "react";
import { useSelector } from "react-redux";


export const useTransactions = () => {
  const {
    isLoading: isEventsLoading,
    eventsInfo,
    canLoadMore,
  } = useSelector(eventsSelector);


  console.log(JSON.stringify(eventsInfo))
  
  const data = useMemo(() => {
    const result: {
      date?: string;
      actions: any;
    }[] = [];

    const eventsCopy = [...Object.values(eventsInfo)];
    eventsCopy.sort((a: EventModel, b: EventModel) => {
      const aEvent = eventsInfo[a.eventId];
      const bEvent = eventsInfo[b.eventId];

      return aEvent.timestamp > bEvent.timestamp ? -1 : 1;
    });

    let lastDate = '';
    let chunk: any = [];
    for (let event of eventsCopy) {
      const ev = eventsInfo[event.eventId];
      const ts = ev.timestamp * 1000;
      const now = new Date();

      // groups elder dates by month only
      let date;
      if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
        date = format(new Date(ts), 'd MMMM', {
          locale: getLocale(),
        });
      } else {
        date = format(new Date(ts), 'LLLL');
      }
      if (date !== lastDate) {
        if (chunk.length > 0) {
          const eventTime = eventsInfo[chunk[0].eventId].timestamp;
          result.push({
            date: formatDate(new Date(eventTime * 1000)),
            actions: chunk,
          });
          chunk = [];
        }

        lastDate = date;
      }

      chunk.push(event);
    }

    if (chunk.length > 0) {
      const txTime = eventsInfo[chunk[0].eventId].timestamp;
      result.push({
        date: formatDate(new Date(txTime * 1000)),
        actions: chunk,
      });
    }

    return result;
  }, []);

  // console.log(JSON.stringify(data));

  return {
    isLoading: false,
    refetch: () => {},
    data: data
  }
}