import { useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useDispatch } from 'react-redux';

import { toastActions } from '$store/toast';
import { ToastActivity } from '$store/toast/interface';
import { isLoadingToast, isFailToast, isSuccessToast } from '../Toast.utils';

export function useToastAnimation(activity: ToastActivity | null) {
  const dispatch = useDispatch();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activity) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [activity]);

  const hide = useCallback(() => {
    if (!activity) {
      return;
    }

    if (!isLoadingToast(activity)) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => dispatch(toastActions.hide()));
    }
  }, [activity, dispatch]);

  useEffect(() => {
    if (!activity) {
      return;
    }

    const shouldHide = isFailToast(activity) || isSuccessToast(activity);

    if (shouldHide) {
      Animated.delay(3000).start(hide);
    }
  }, [activity]);

  return { progress, hide };
}
