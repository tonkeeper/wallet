import { ToastActivity } from '$store/toast/interface';

const isThisToast = (activity: ToastActivity) => (currentActivity: ToastActivity) =>
  currentActivity === activity;

export const isSuccessToast = isThisToast(ToastActivity.SUCCESS);
export const isLoadingToast = isThisToast(ToastActivity.LOADING);
export const isFailToast = isThisToast(ToastActivity.FAIL);
