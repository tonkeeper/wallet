import { StackAnimationTypes } from 'react-native-screens';

export type ModalRouteConfig = {
  component: React.ComponentType;
  path: string;
  restProps: any;
};

export type ModalRouteConfigByType = {
  native: ModalRouteConfig[];
  sheets: ModalRouteConfig[];
};

export type ModalBehavior =
  | 'sheet'
  | 'modal'
  | 'fullScreenModal'
  | 'transparentModal'
  | 'containedModal'
  | 'containedTransparentModal'
  | 'formSheet';

export type WithPath<T> = Omit<T, 'name' | 'component'> & {
  component: React.ComponentType<any>;
  path: string;
};

export type AdditionalRouteConfig = {
  animation?: StackAnimationTypes;
  behavior?: ModalBehavior;
};
