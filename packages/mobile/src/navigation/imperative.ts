import { StackActions } from '@react-navigation/routers';
import { mergeRefs } from '@tonkeeper/uikit';
import { createRef } from 'react';
import {
  CommonActions,
  createNavigationContainerRef,
  useRoute,
} from '@react-navigation/native';
import { extrernalNavigationRef } from '@tonkeeper/router/src/imperative';

export const navigationRef_depreceted = createRef<any>();
export const navigationRef = createNavigationContainerRef<any>();

export const setNavigationRef = mergeRefs(navigationRef_depreceted, navigationRef, extrernalNavigationRef);

let navigationIsReady = false;
export const getCurrentRouteName = () => {
  if (navigationIsReady) {
    return navigationRef.getCurrentRoute()?.name;
  }

  return null;
};

export const onNavigationReady = () => {
  navigationIsReady = true;
};

export function getCurrentRoute() {
  if (!navigationRef_depreceted.current) {
    return null;
  }

  const state = navigationRef_depreceted.current.getRootState();
  let route = state?.routes?.[state.index];

  while (route?.state?.index !== undefined && route?.state?.index !== null) {
    route = route.state.routes[route.state.index];
  }

  return route ?? null;
}

export function navigate(name: string, params?: any) {
  navigationRef.navigate(name, params);
}

export function replace(name: string, params?: any) {
  navigationRef.dispatch(StackActions.replace(name, params));
}

export function push(routeName: string, params?: any) {
  navigationRef.dispatch(StackActions.push(routeName, params));
}

export function popToTop() {
  navigationRef.dispatch(StackActions.popToTop());
}

export function popTo(count: number) {
  navigationRef.dispatch(StackActions.pop(count));
}

export function goBack() {
  navigationRef.goBack();
}

export function reset(screenName: string) {
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screenName }],
    }),
  );
}

export const useParams = <T>(): Partial<T> => {
  const route = useRoute();
  return route.params ?? {};
};
