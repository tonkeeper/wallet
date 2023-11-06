const USDT = require('./USDT.png');
const BTC = require('./BTC.png');
const ETH = require('./ETH.png');

export const getCryptoAssetIconSource = (asset: string) => {
  switch (asset) {
    case 'USDT':
      return USDT;
    case 'BTC':
      return BTC;
    case 'ETH':
      return ETH;
    default:
      return null;
  }
};
