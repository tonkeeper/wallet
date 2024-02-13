export enum ToastSize {
  Small = 'small',
  Large = 'large',
}

export type ToastOptions = {
  duration?: number;
  isLoading?: boolean;
  size?: ToastSize;
  warning?: boolean;
};

export type CurrentToast = ToastOptions & {
  message: string;
};

export interface IToastStore {
  currentToast: CurrentToast | null;
  shouldHide: boolean;
  toastTimeout: NodeJS.Timeout | null;
  actions: {
    cancelAutoHide: () => void;
    hide: () => void;
    clear: () => void;
    show: (message?: string, options?: ToastOptions) => void;
    fail: (message?: string, options?: ToastOptions) => void;
    success: (message?: string, options?: ToastOptions) => void;
    warning: (message?: string, options?: ToastOptions) => void;
    loading: () => void;
  };
}
