import { debugLog } from '$utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { getTimeSec } from './getTimeSec';
import _ from "lodash";

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

export enum SUBSCRIBE_STATUS {
  SUBSCRIBED,
  UNSUBSCRIBED,
  NOT_SPECIFIED,
}

let _subscribeStatus: SUBSCRIBE_STATUS = SUBSCRIBE_STATUS.NOT_SPECIFIED;

export async function saveSubscribeStatus() {
  try {
    await AsyncStorage.setItem('isSubscribeNotifications', 'true');
    _subscribeStatus = SUBSCRIBE_STATUS.SUBSCRIBED;
  } catch (err) {
    _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
    debugLog('[saveSubscribeStatus]', err);
  }
}

export async function removeSubscribeStatus() {
  try {
    await AsyncStorage.setItem('isSubscribeNotifications', 'false');
    _subscribeStatus = SUBSCRIBE_STATUS.UNSUBSCRIBED;
  } catch (err) {
    _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
    debugLog('[removeSubscribeStatus]', err);
  }
}

export async function clearSubscribeStatus() {
  try {
    await AsyncStorage.removeItem('isSubscribeNotifications');
    _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
  } catch (err) {
    _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
    debugLog('[removeSubscribeStatus]', err);
  }
}

export async function getSubscribeStatus() {
  if (_subscribeStatus !== SUBSCRIBE_STATUS.NOT_SPECIFIED) {
    return _subscribeStatus;
  }

  try {
    const status = await AsyncStorage.getItem('isSubscribeNotifications');
    if (_.isNil(status)) {
      _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
    } else if (status === 'true') {
      _subscribeStatus = SUBSCRIBE_STATUS.SUBSCRIBED;
    } else {
      _subscribeStatus = SUBSCRIBE_STATUS.UNSUBSCRIBED;
    }
    return _subscribeStatus;
  } catch (err) {
    _subscribeStatus = SUBSCRIBE_STATUS.NOT_SPECIFIED;
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

    if (status === SUBSCRIBE_STATUS.NOT_SPECIFIED) {
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
