import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';

import { ParamList } from '$navigation/AppNavigator';

export enum ModalName {
  EDIT_COINS = 'EDIT_COINS',
  REQUIRE_WALLET = 'REQUIRE_WALLET',
  CONFIRM_SENDING = 'CONFIRM_SENDING',
  EXCHANGE_METHOD = 'EXCHANGE_METHOD',
  CREATE_SUBSCRIPTION = 'CREATE_SUBSCRIPTION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TON_LOGIN = 'TON_LOGIN',
  EXCHANGE = 'EXCHANGE',
  INFO_ABOUT_INACTIVE = 'INFO_ABOUT_INACTIVE',
  DEPLOY = 'DEPLOY',
  REMINDER_ENABLE_NOTIFICATIONS = 'REMINDER_ENABLE_NOTIFICATIONS',
  APPEARANCE = 'APPEARANCE',
  NFT_TRANSFER_INPUT_ADDRESS_MODAL = 'NFT_TRANSFER_INPUT_ADDRESS_MODAL',
  NFT_TRANSFER = 'NFT_TRANSFER',
  MARKETPLACES = 'MARKETPLACES',
  ADD_EDIT_FAVORITE_ADDRESS = 'ADD_EDIT_FAVORITE_ADDRESS',
  LINKING_DOMAIN = 'LINKING_DOMAIN',
  REPLACE_DOMAIN_ADDRESS = 'REPLACE_DOMAIN_ADDRESS',
}

export type VisibilityState = {
  [modalName in ModalName]: boolean;
};

export type VisibilityReducer = (
  state: VisibilityState,
  name: ModalName,
) => VisibilityState;

export interface ModalContainerProps {
  route: RouteProp<ParamList, 'ModalContainer'>;
  navigation: StackNavigationProp<ParamList, 'ModalContainer'>;
}
