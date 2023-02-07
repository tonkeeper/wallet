import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootReducer } from './rootReducer';
import { rootSaga } from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

function enableBatching(reducer: any) {
  return function batchingReducer(state: any, action: any) {
    switch (action.type) {
      case 'BATCH_ACTIONS':
        return action.actions.reduce(batchingReducer, state);
      default:
        return reducer(state, action);
    }
  };
}

const configStore = () => {
  const store = configureStore({
    reducer: enableBatching(rootReducer),
    devTools: true,
    middleware: [
      ...getDefaultMiddleware({ thunk: false, serializableCheck: false }),
      sagaMiddleware,
    ],
  });

  sagaMiddleware.run(rootSaga);

  return store;
};

export const store = configStore();

export function batchActions(...actions: any) {
  return {
    type: 'BATCH_ACTIONS',
    actions: actions,
  };
}

// new store
export * from './zustand';
