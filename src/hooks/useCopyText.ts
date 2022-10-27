import { useCallback } from 'react';
import Clipboard from '@react-native-community/clipboard';
import { t } from '$translation';
import { triggerImpactLight } from '$utils';
import { Toast } from '$store';

export const useCopyText = () => {
  return useCallback((value?: string | boolean, toastText?: string) => {
    if (value) {
      Clipboard.setString(String(value));
      Toast.success(toastText || t('copied'));
      triggerImpactLight();
    }
  }, []);
};

export const copyText = (value?: string | boolean) => {
  if (value) {
    Clipboard.setString(String(value));
    Toast.success(t('copied'));
  }
};
