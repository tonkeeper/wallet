export interface ISwapAsset {
  address: string;
  symbol: string;
}

export type SwapAssets = {
  [key: string]: ISwapAsset;
};

export interface ISwapStore {
  assets: SwapAssets;
  actions: {
    fetchAssets: () => Promise<void>;
  };
}

export interface StonFiItem {
  address: string; //"EQCSqjXUUfo7txZVeIpiB5ObyJ_dBOOdtXQNBIwvjMefNpF0"
  apy_1d: string; //"0.010509024542116885"
  apy_7d: string; // "1.090410672685333"
  apy_30d: string; // "1.090410672685333"
  collected_token0_protocol_fee: string; //"309131"
  collected_token1_protocol_fee: string; // "111845809"
  deprecated: boolean; //false
  lp_fee: string; //"20"
  lp_total_supply: string; //"209838035"
  protocol_fee: string; // "10"
  protocol_fee_address: string; // "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
  ref_fee: string; // "10"
  reserve0: string; // "9998902465"
  reserve1: string; // "4489590433195"
  router_address: string; // "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"
  token0_address: string; // "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728"
  token1_address: string; // "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
}

export interface StonFiAsset {
  contract_address: string; //"EQCcLAW537KnRg_aSPrnQJoyYjOZkzqYp6FVmRUvN1crSazV"
  decimals: number; //9
  default_symbol: boolean; //false
  deprecated: boolean; //false
  display_name: string; //"Ambra"
  image_url: string; //"https://asset.ston.fi/img/EQCcLAW537KnRg_aSPrnQJoyYjOZkzqYp6FVmRUvN1crSazV"
  kind: string; //"JETTON"
  symbol: string; //"AMBR"
}
