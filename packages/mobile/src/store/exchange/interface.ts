import { ExchangeCategoryModel, ExchangeMethodModel } from '$store/models';
import { PayloadAction } from '@reduxjs/toolkit';

export type ExchangeMethods = { [index: string]: ExchangeMethodModel };

export interface ExchangeState {
  isLoading: boolean;
  categories: ExchangeCategoryModel[];
  methodInfo: ExchangeMethods;
}

export type SetLoadedMethodsAction = PayloadAction<{
  categories: ExchangeCategoryModel[];
  methods: ExchangeMethods;
}>;
