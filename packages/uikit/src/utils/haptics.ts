import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const triggerHapticFeedback = (method: HapticFeedbackTypes) => {
  ReactNativeHapticFeedback.trigger(method, {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: false,
  });
};

export const Haptics = {
  notificationSuccess: () => triggerHapticFeedback('notificationSuccess'),
  notificationError: () => triggerHapticFeedback('notificationError'),
  impactLight: () => triggerHapticFeedback('impactLight'),
  impactMedium: () => triggerHapticFeedback('impactMedium'),
  selection: () => triggerHapticFeedback('selection'),
};
