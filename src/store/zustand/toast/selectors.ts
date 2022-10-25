import omit from 'lodash/omit';
import { IToastStore } from './types';

export const getToastState = (state: IToastStore) => omit(state, 'actions');

export const getToastActions = (state: IToastStore) => state.actions;
