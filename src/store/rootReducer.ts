import { combineReducers } from '@reduxjs/toolkit';

import { reducer as main } from './main';
import { reducer as wallet } from './wallet';
import { reducer as rates } from './rates';
import { reducer as events } from './events';
import { reducer as toast } from './toast';
import { reducer as subscriptions } from './subscriptions';
import { reducer as exchange } from './exchange';
import { reducer as nfts } from './nfts';
import { reducer as jettons } from './jettons';
import { reducer as favorites } from './favorites';

export const rootReducer = combineReducers({
  main,
  wallet,
  rates,
  events,
  toast,
  subscriptions,
  exchange,
  nfts,
  jettons,
  favorites,
});

export type RootState = ReturnType<typeof rootReducer>;
