import { RouteProp } from '@react-navigation/native';

import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';
import { Account } from '@tonkeeper/core';

export interface SendProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.Send>;
}

export enum SendSteps {
  ADDRESS = 'ADDRESS',
  AMOUNT = 'AMOUNT',
  CONFIRM = 'CONFIRM',
}

export enum SuggestedAddressType {
  RECENT = 'RECENT',
  FAVORITE = 'FAVORITE',
}

export interface SuggestedAddress {
  address: string;
  type: SuggestedAddressType;
  name?: string;
  domain?: string;
  domainUpdated?: boolean;
  timestamp?: number;
}

export interface SendRecipient {
  name?: string;
  domain?: string;
  address: string;
}

export interface SendAmount {
  value: string;
  all: boolean;
}

export interface AccountWithPubKey extends Account {
  publicKey?: string;
}
