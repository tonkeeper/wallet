import { TonAPI } from '@tonkeeper/core';
import { config } from './config';
// import { wallet } from './wallet';

export const tonapi = new TonAPI({
  token: () => config.get('tonapiAuthToken'),
  host: () => {
    // if (wallet.testnet) {
    //   return config.get('tonapiTestnetHost');
    // }
    
    return config.get('tonapiProdHost');
  },
});
