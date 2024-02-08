import { combineReducers } from '@reduxjs/toolkit';

import { reducer as main } from './main';
import { reducer as wallet } from './wallet';
import { reducer as subscriptions } from './subscriptions';
import { reducer as favorites } from './favorites';

export const rootReducer = combineReducers({
  main,
  wallet,
  subscriptions,
  favorites,
});

export type RootState = ReturnType<typeof rootReducer>;
