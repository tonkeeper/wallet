import {
  EventArg,
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/core';
import { useEffect, useRef } from 'react';

export const useTabPress = (fn: () => void) => {
  const navigation = useNavigation();
  const route = useRoute();

  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let tabNavigations: NavigationProp<ReactNavigation.RootParamList>[] = [];
    let currentNavigation = navigation;

    // If the screen is nested inside multiple tab navigators, we should scroll to top for any of them
    // So we need to find all the parent tab navigators and add the listeners there
    while (currentNavigation) {
      if (currentNavigation.getState().type === 'tab') {
        tabNavigations.push(currentNavigation);
      }

      currentNavigation = currentNavigation.getParent();
    }

    if (tabNavigations.length === 0) {
      return;
    }

    const unsubscribers = tabNavigations.map((tab) => {
      return tab.addListener(
        // We don't wanna import tab types here to avoid extra deps
        // in addition, there are multiple tab implementations
        // @ts-expect-error
        'tabPress',
        (e: EventArg<'tabPress', true>) => {
          // We should scroll to top only when the screen is focused
          const isFocused = navigation.isFocused();

          const isFirst =
            tabNavigations.includes(navigation) ||
            navigation.getState().routes[0].key === route.key;

          if (isFocused && isFirst && !e.defaultPrevented) {
            fnRef.current();
          }
        },
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [navigation, route.key]);
};
