import { PayloadAction } from '@reduxjs/toolkit';

export enum ToastActivity {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

type ToastOptions = {
  label: string;
  type: 'large' | 'small';
};

export type SetToastAction = PayloadAction<string | undefined | ToastOptions>;

export interface ToastState {
  label: string;
  activity: ToastActivity | null;
  type: 'large' | 'small';
}
