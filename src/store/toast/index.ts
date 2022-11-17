import { RootState } from '$store/rootReducer';

import { createSlice } from '@reduxjs/toolkit';

import { ToastActivity, ToastState, SetToastAction } from './interface';
import { t } from '$translation';

const initialState: ToastState = {
  label: '',
  activity: null,
  type: 'large',
};

const { reducer, actions } = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    loading(state, action: SetToastAction) {
      state.activity = ToastActivity.LOADING;
      if (typeof action.payload === 'string') {
        state.label = action.payload || t('loading');
      } else {
        state.label = action.payload?.label || t('loading');
        state.type = action.payload?.type || 'large';
      }
    },
    success(state, action: SetToastAction) {
      state.activity = ToastActivity.SUCCESS;
      if (typeof action.payload === 'string') {
        state.label = action.payload || t('success');
      } else {
        state.label = action.payload?.label || t('success');
        state.type = action.payload?.type || 'large';
      }
    },
    fail(state, action: SetToastAction) {
      state.activity = ToastActivity.FAIL;
      if (typeof action.payload === 'string') {
        state.label = action.payload || t('error_occurred');
      } else {
        state.label = action.payload?.label || t('error_occurred');
        state.type = action.payload?.type || 'large';
      }
    },
    hide(state) {
      state.label = '';
      state.activity = null;
    },
  },
});

export { actions as toastActions, reducer };

export const toastSelector = (state: RootState) => state.toast;
