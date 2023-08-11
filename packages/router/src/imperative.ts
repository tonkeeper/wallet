import { StackActions } from '@react-navigation/routers';
import {
  CommonActions,
  createNavigationContainerRef,
  useRoute,
} from '@react-navigation/native';

export const extrernalNavigationRef = createNavigationContainerRef<any>();

function navigate(name: string, params?: any) {
  extrernalNavigationRef.navigate(name, params);
}

function replace(name: string, params?: any) {
  extrernalNavigationRef.dispatch(StackActions.replace(name, params));
}

function push(routeName: string, params?: any) {
  extrernalNavigationRef.dispatch(StackActions.push(routeName, params));
}

function popToTop() {
  extrernalNavigationRef.dispatch(StackActions.popToTop());
}

function popTo(count: number) {
  extrernalNavigationRef.dispatch(StackActions.pop(count));
}

function goBack() {
  extrernalNavigationRef.goBack();
}

function reset(screenName: string) {
  extrernalNavigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screenName }],
    }),
  );
}

export const navigation = { 
  navigate,
  replace,
  push,
  popToTop,
  popTo,
  goBack,
  reset
};

export const useParams = <T>(): Partial<T> => {
  const route = useRoute();
  return route.params ?? {};
};
