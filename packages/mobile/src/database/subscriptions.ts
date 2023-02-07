import AsyncStorage from '@react-native-async-storage/async-storage';

import { SubscriptionModel } from '$store/models';
import { getWalletName } from '$shared/dynamicConfig';

export async function saveSubscriptions(subscriptions: SubscriptionModel[]) {
  const wallet = getWalletName();
  await AsyncStorage.setItem(`${wallet}_subscriptions`, JSON.stringify(subscriptions));
}

export async function getSubscriptions(): Promise<SubscriptionModel[]> {
  const wallet = getWalletName();

  const raw = await AsyncStorage.getItem(`${wallet}_subscriptions`);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
