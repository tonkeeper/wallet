import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};

const triggerHapticFeedback = (method: HapticFeedbackTypes) => () => {
  ReactNativeHapticFeedback.trigger(method, options);
};

export const triggerSelection = triggerHapticFeedback('selection');
export const triggerImpactLight = triggerHapticFeedback('impactLight');

export const triggerImpactMedium = triggerHapticFeedback('impactMedium');
export const triggerImpactHeavy = triggerHapticFeedback('impactHeavy');

export const triggerNotificationSuccess = triggerHapticFeedback('notificationSuccess');
export const triggerNotificationError = triggerHapticFeedback('notificationError');

export const Haptics = {
  selection: triggerSelection,
  impactLight: triggerImpactLight,
  impactMedium: triggerImpactMedium,
  impactHeavy: triggerImpactHeavy,
  notificationSuccess: triggerNotificationSuccess,
  notificationError: triggerNotificationError,
};
