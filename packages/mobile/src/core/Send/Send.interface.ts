import { RouteProp } from '@react-navigation/native';

import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';
import { Account } from '@tonkeeper/core/src/legacy';

export enum TokenType {
  TON = 'TON',
  Jetton = 'Jetton',
  Inscription = 'Inscription',
  USDT = 'USDT',
}

export type InscriptionAdditionalParams = {
  type: string;
};

export type CurrencyAdditionalParams = {} | InscriptionAdditionalParams;

export interface SendProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.Send>;
}

export enum SendSteps {
  ADDRESS = 0,
  AMOUNT = 1,
  CONFIRM = 2,
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
  blockchain: 'ton' | 'tron';
}

export interface SendAmount {
  value: string;
  all: boolean;
}

export interface AccountWithPubKey extends Account {
  publicKey?: string;
}
