import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISwapStore, StonFiAsset, StonFiItem, SwapAssets } from './types';
import BigNumber from 'bignumber.js';

const defaultDecimals = 9;
const minTonReverse = 500;

const StonFiTon = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
const StonFiWton = 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv';

const initialState: Omit<ISwapStore, 'actions'> = {
  assets: {},
};

export const useSwapStore = create(
  persist<ISwapStore>(
    (set) => ({
      ...initialState,
      actions: {
        fetchAssets: async () => {
          try {
            const assets = await fetch('https://app.ston.fi/rpc', {
              method: 'POST',
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'asset.list',
              }),
              headers: { 'content-type': 'application/json' },
            });

            const result = await fetch('https://app.ston.fi/rpc', {
              method: 'POST',
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'pool.list',
              }),
              headers: { 'content-type': 'application/json' },
            });

            const data: StonFiItem[] = (await result.json()).result.pools;
            const assetList: StonFiAsset[] = (await assets.json()).result.assets;

            const items = data.reduce((acc, item) => {
              let tonReverse: string | undefined;
              let jettonAddress: string | undefined;
              if (
                item.token1_address === StonFiTon ||
                item.token1_address === StonFiWton
              ) {
                tonReverse = item.reserve1;
                jettonAddress = item.token0_address;
              }
              if (
                item.token0_address === StonFiTon ||
                item.token0_address === StonFiWton
              ) {
                tonReverse = item.reserve0;
                jettonAddress = item.token1_address;
              }
              if (!tonReverse || !jettonAddress) {
                return acc;
              }

              if (
                new BigNumber(tonReverse).isLessThan(
                  new BigNumber(minTonReverse).shiftedBy(defaultDecimals),
                )
              ) {
                return acc;
              }

              const asset = assetList.find((a) => a.contract_address === jettonAddress);
              if (!asset) {
                return acc;
              }

              acc[jettonAddress] = {
                address: jettonAddress,
                symbol: asset.symbol,
              };

              return acc;
            }, {} as SwapAssets);

            set({ assets: items });
          } catch {}
        },
      },
    }),
    {
      name: 'swap',
      getStorage: () => AsyncStorage,
      partialize: ({ assets }) => ({ assets } as ISwapStore),
    },
  ),
);
