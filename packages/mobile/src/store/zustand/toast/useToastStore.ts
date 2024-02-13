import { t } from '@tonkeeper/shared/i18n';
import { Haptics } from '$utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { IToastStore, ToastSize } from './types';

const initialState: Omit<IToastStore, 'actions'> = {
  currentToast: null,
  shouldHide: false,
  toastTimeout: null,
};

export const useToastStore = create(
  subscribeWithSelector<IToastStore>((set, get) => ({
    ...initialState,
    actions: {
      cancelAutoHide: () => {
        set(({ toastTimeout }) => {
          if (toastTimeout) {
            clearTimeout(toastTimeout);
          }

          return { toastTimeout: null };
        });
      },
      hide: () => {
        get().actions.cancelAutoHide();
        set({ shouldHide: true });
      },
      clear: () => {
        set({ currentToast: null, shouldHide: false });
      },
      show: (message, options) => {
        get().actions.cancelAutoHide();

        const duration = options?.duration ?? 3000;

        const toastTimeout =
          duration !== -1 ? setTimeout(() => get().actions.hide(), duration) : null;

        set({
          currentToast: {
            message: message ?? t('error_occurred'),
            size: options?.size ?? ToastSize.Large,
            ...options,
          },
          shouldHide: false,
          toastTimeout,
        });
      },
      fail: (message, options) => {
        get().actions.show(message, options);
        Haptics.notificationError();
      },
      success: (message, options) => {
        get().actions.show(message, options);
        Haptics.notificationSuccess();
      },
      warning: (message, options) => {
        get().actions.show(message, { ...options, warning: true });
        Haptics.notificationSuccess();
      },
      loading: () => {
        get().actions.show(t('loading'), {
          duration: -1,
          isLoading: true,
        });
      },
    },
  })),
);
