import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ISwapStore, StonFiAsset, StonFiItem, SwapAssets } from './types';

const StonFiTon = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

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
              if (!acc[item.token0_address] && item.token0_address !== StonFiTon) {
                const asset = assetList.find(
                  (a) => a.contract_address === item.token0_address,
                );

                if (asset) {
                  acc[item.token0_address] = {
                    address: item.token0_address,
                    symbol: asset.symbol,
                  };
                }
              }
              if (!acc[item.token1_address] && item.token1_address !== StonFiTon) {
                const asset = assetList.find(
                  (a) => a.contract_address === item.token1_address,
                );

                if (asset) {
                  acc[item.token1_address] = {
                    address: item.token1_address,
                    symbol: asset.symbol,
                  };
                }
              }

              return acc;
            }, {} as SwapAssets);

            set({ assets: items });
          } catch {}
        },
      },
    }),
    {
      name: 'swap',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ assets }) => ({ assets } as ISwapStore),
    },
  ),
);
