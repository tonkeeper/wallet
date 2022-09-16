import { debugLog } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { getTimeSec } from './getTimeSec';

export async function getToken() {
  return await messaging().getToken();
}

export async function getPermission() {
  const authStatus = await messaging().hasPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export async function requestUserPermissionAndGetToken() {
  const hasPermission = await getPermission();

  if (!hasPermission) {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return false;
    }
  }

  return await getToken();
}

let _subscribeStatus: boolean | null = null;

export async function saveSubscribeStatus() {
  try {
    await AsyncStorage.setItem('isSubscribeNotifications', 'true');
    _subscribeStatus = true;
  } catch (err) {
    _subscribeStatus = null;
    debugLog('[saveSubscribeStatus]', err);
  }
}

export async function removeSubscribeStatus() {
  try {
    await AsyncStorage.removeItem('isSubscribeNotifications');
    _subscribeStatus = false;
  } catch (err) {
    _subscribeStatus = null;
    debugLog('[removeSubscribeStatus]', err);
  }
}

export async function getSubscribeStatus() {
  if (_subscribeStatus !== null) {
    return _subscribeStatus;
  }

  try {
    const status = await AsyncStorage.getItem('isSubscribeNotifications');
    _subscribeStatus = Boolean(status);

    return _subscribeStatus;
  } catch (err) {
    _subscribeStatus = null;
    return false;
  }
}

export async function saveReminderNotifications() {
  try {
    const twoWeeksInSec = 60 * 60 * 24 * 7 * 2;
    const nextShowTime = getTimeSec() + twoWeeksInSec;
    await AsyncStorage.setItem('ReminderNotificationsTimestamp', String(nextShowTime));
  } catch (err) {}
}

export async function removeReminderNotifications() {
  try {
    await AsyncStorage.removeItem('ReminderNotificationsTimestamp');
  } catch (err) {}
}

export async function shouldOpenReminderNotifications() {
  try {
    const status = await getSubscribeStatus();
    const timeToShow = await AsyncStorage.getItem('ReminderNotificationsTimestamp');

    if (!status) {
      if (!timeToShow) {
        return true;
      }

      return getTimeSec() > Number(timeToShow);
    }

    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function saveDontShowReminderNotifications() {
  try {
    await AsyncStorage.setItem('DontShowReminderNotifications', 'true');
  } catch (err) {}
}

export async function shouldOpenReminderNotificationsAfterUpdate() {
  try {
    const hasPermission = await getPermission();
    const dontShow = await AsyncStorage.getItem('DontShowReminderNotifications');

    return !hasPermission && !dontShow;
  } catch (err) {
    debugLog(err);
    return false;
  }
}
