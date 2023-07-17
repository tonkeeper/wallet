import { TonAPI } from '@tonkeeper/core';
import { config } from './config';
// import { wallet } from './wallet';

export const tonapi = new TonAPI({
  token: () => config.get('tonApiV2Key'),
  baseUrl: () => {
    // if (wallet.testnet) {
    //   return config.get('tonapiTestnetHost');
    // }
    
    return config.get('tonapiIOEndpoint');
  },
});
