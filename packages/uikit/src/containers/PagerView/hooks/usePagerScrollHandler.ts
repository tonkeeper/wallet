import { useEvent, useHandler } from 'react-native-reanimated';
import { DependencyList } from 'react';

type PageScrollEvent = {
  position: number;
  offset: number;
};

type OnPageScroll = (event: PageScrollEvent) => void;

type PageScrollHandlers = {
  onPageScroll: OnPageScroll;
};

export function usePagerScrollHandler(
  handlers: PageScrollHandlers,
  dependencies?: DependencyList,
) {
  const { doDependenciesDiffer } = useHandler(handlers, dependencies);
  const subscribeForEvents = ['onPageScroll'];

  return useEvent(
    (event: any) => {
      'worklet';
      const { onPageScroll } = handlers;
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer,
  );
}
