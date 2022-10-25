import { useCallback } from 'react';
import Clipboard from '@react-native-community/clipboard';
import { t } from '$translation';
import { triggerImpactLight } from '$utils';
import { useToastStore } from '$store';

export const useCopyText = () => {
  return useCallback((value?: string | boolean, toastText?: string) => {
    if (value) {
      Clipboard.setString(String(value));
      useToastStore.getState().actions.success(toastText || t('copied'));
      triggerImpactLight();
    }
  }, []);
};

export const copyText = (value?: string | boolean) => {
  if (value) {
    Clipboard.setString(String(value));
    useToastStore.getState().actions.success(t('copied'));
  }
};
