import { createExternalRef } from '../../utils/createExternalRef';

export enum ToastSize {
  Small = 'small',
  Large = 'large',
}

export type ToastOptions = {
  duration?: number;
  isLoading?: boolean;
  size?: ToastSize;
};

export type ToastData = ToastOptions & {
  message: string;
  size: ToastSize;
};

type ToastActions = {
  success(message: string, options?: ToastOptions): void;
  warning(message: string, options?: ToastOptions): void;
  fail(message: string, options?: ToastOptions): void;
  show(message: string, options?: ToastOptions): void;
  loading(): void;
  clear(): void;
  hide(): void;
};

export const Toast = createExternalRef<ToastActions>();
