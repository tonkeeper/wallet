import { all, takeLatest, call, put, fork, select, delay } from 'redux-saga/effects';
import axios from 'axios';

import { ratesActions, ratesSelector } from '$store/rates/index';
import { batchActions } from '$store';
import {
  loadChartData,
  loadRatesResult,
  saveChartData,
  saveRatesResult,
} from '$database';
import { CryptoCurrencies } from '$shared/constants';
import { getServerConfig } from '$shared/constants/serverConfig';
import { withRetry } from '$store/retry';
import { LoadRatesAction } from '$store/rates/interface';

function* loadRatesWorker(action: LoadRatesAction) {
  try {
    yield fork(doLoadTonChartWorker, action.payload.onlyCache);

    const { rates } = yield select(ratesSelector);
    if (Object.keys(rates).length === 0) {
      const cached = yield call(loadRatesResult);
      if (cached) {
        yield put(
          batchActions(
            ratesActions.setRates(cached.today),
            ratesActions.setYesterdayRates(cached.yesterday),
          ),
        );
      }
    }

    if (action.payload.onlyCache) {
      return;
    }

    const resp = yield withRetry(
      'loadYeasterdayRates',
      axios.get,
      `${getServerConfig('tonkeeperEndpoint')}/stock`,
    );

    const { today, yesterday } = resp.data.data;

    yield put(
      batchActions(
        ratesActions.setRates(today),
        ratesActions.setYesterdayRates(yesterday),
      ),
    );

    yield fork(saveRatesResult, today, yesterday);
  } catch (e) {
    yield delay(3000);
    yield put(ratesActions.loadRates(action.payload));
  }
}

function* loadTonChartWorker() {
  yield call(doLoadTonChartWorker, false);
}

function* doLoadTonChartWorker(onlyCache: boolean) {
  try {
    const { charts } = yield select(ratesSelector);
    if (!charts[CryptoCurrencies.Ton]) {
      const cached = yield call(loadChartData, CryptoCurrencies.Ton);
      if (cached) {
        yield put(ratesActions.setTonChart(cached));
      }
    }

    if (onlyCache) {
      return;
    }

    const resp = yield withRetry(
      'loadTonChartWorker',
      axios.get,
      `${getServerConfig('tonkeeperEndpoint')}/stock/chart`,
    );

    const points = resp.data.data;

    yield put(ratesActions.setTonChart(points));
    yield fork(saveChartData, CryptoCurrencies.Ton, points);
  } catch (e) {
    console.log('err', e.message);
  }
}

export function* ratesSaga() {
  yield all([
    takeLatest(ratesActions.loadRates, loadRatesWorker),
    takeLatest(ratesActions.loadTonChart, loadTonChartWorker),
  ]);
}
