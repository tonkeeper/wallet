import { FiatCurrencies, getServerConfig } from '$shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuration, RatesApi } from '@tonkeeper/core/src/legacy';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IRatesStore, TRates } from './types';
import { i18n } from '$translation';
import { store } from '$store';
import { JettonsState } from '$store/jettons/interface';

const getRatesApi = () => {
  return new RatesApi(
    new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
        'Accept-Language': i18n.locale,
      },
    }),
  );
};

const initialState: Omit<IRatesStore, 'actions'> = {
  rates: {},
};

export const useRatesStore = create(
  persist<IRatesStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchRates: async () => {
          const tokens = [
            'USDT',
            'ton',
            ...(store.getState().jettons as JettonsState).jettonBalances.map(
              (jetton) => jetton.jettonAddress,
            ),
          ].join(',');

          const currencies = ['ton', 'USDT', ...Object.keys(FiatCurrencies)]
            .map((currency) => currency.toLowerCase())
            .join(',');

          try {
            const response = await getRatesApi().getRates({ tokens, currencies });

            const rates = response.rates as TRates;
            // rates['EQAiQ2XK7BXePLwemeo-u4wNyjg-wxGeySmaFGEP7R2MhUWs'] = {
            //   prices: {
            //     ...Object.keys(rates.TON.prices).reduce((result, key) => {
            //       result[key] = rates.TON.prices[key] * 1.5;
            //       return result;
            //     }, {}),
            //   },
            //   diff_24h: rates.TON.diff_24h,
            // };

            set({ rates });
          } catch (e) {
            console.log('rates error', e);
          }
        },
      },
    }),
    {
      name: 'rates-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ rates }) => ({ rates } as IRatesStore),
    },
  ),
);
