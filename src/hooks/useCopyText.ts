import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import { toastActions } from '$store/toast';
import { t } from '$translation';
import { triggerImpactLight } from '$utils';
import { Toast } from '$uikit/Toast/new';

export const useCopyText = () => {
  const dispatch = useDispatch();

  return useCallback(
    (value?: string | boolean, toastText?: string) => {
      if (value) {
        Clipboard.setString(String(value));
        dispatch(toastActions.success(toastText || t('copied')));
        triggerImpactLight();
      }
    },
    [dispatch],
  );
};

export const copyText = (value?: string | boolean) => {
  if (value) {
    Clipboard.setString(String(value));
    Toast.success(t('copied'));
  }
};
