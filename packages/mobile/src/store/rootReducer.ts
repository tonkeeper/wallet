import { combineReducers } from '@reduxjs/toolkit';

import { reducer as main } from './main';
import { reducer as wallet } from './wallet';
import { reducer as events } from './events';
import { reducer as subscriptions } from './subscriptions';
import { reducer as nfts } from './nfts';
import { reducer as jettons } from './jettons';
import { reducer as favorites } from './favorites';

export const rootReducer = combineReducers({
  main,
  wallet,
  events,
  subscriptions,
  nfts,
  jettons,
  favorites,
});

export type RootState = ReturnType<typeof rootReducer>;
