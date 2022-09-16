import { action, makeObservable, observable } from 'mobx';
import { Haptics } from '$utils';
import { t } from '$translation';

type ToastSize = 'large' | 'small';

type ToastOptions = {
  duration?: number;
  isLoading?: boolean;
  size?: ToastSize;
};

export type ToastState = ToastOptions & {
  message: string;
};

export class ToastStore {
  private toastTimeout: NodeJS.Timeout | null = null;

  @observable.deep
  public toast: ToastState | null = null;

  @observable
  public shouldHide = false;

  constructor() {
    makeObservable(this);
  }

  @action
  public hide() {
    this.cancelAutoHide();
    this.shouldHide = true;
  }

  @action
  public clear() {
    this.toast = null;
    this.shouldHide = false;
  }

  @action
  public show(message?: string, options?: ToastOptions) {
    this.cancelAutoHide();

    const duration = options?.duration ?? 3000;

    this.shouldHide = false;
    this.toast = {
      message: message ?? t('error_occurred'),
      size: options?.size ?? 'large',
      isLoading: options?.isLoading,
      duration,
    };

    if (duration !== -1) {
      this.toastTimeout = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  public fail(message?: string, options?: ToastOptions) {
    this.show(message, options);
    Haptics.notificationError();
  }

  public success(message?: string, options?: ToastOptions) {
    this.show(message, options);
    Haptics.notificationSuccess();
  }

  public loading() {
    this.show(t('loading'), {
      duration: -1,
      isLoading: true,
    });
  }

  private cancelAutoHide() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }
}

export const Toast = new ToastStore();
