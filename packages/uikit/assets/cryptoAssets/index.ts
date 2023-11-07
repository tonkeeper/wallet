const USDT = require('./USDT.png');
const BTC = require('./BTC.png');
const ETH = require('./ETH.png');
const XRP = require('./XRP.png');
const ADA = require('./ADA.png');
const BNB = require('./BNB.png');
const SOL = require('./SOL.png');
const TON = require('./TON.png');

export const getCryptoAssetIconSource = (asset: string) => {
  switch (asset) {
    case 'USDT':
      return USDT;
    case 'BTC':
      return BTC;
    case 'ETH':
      return ETH;
    case 'XRP':
      return XRP;
    case 'ADA':
      return ADA;
    case 'BNB':
      return BNB;
    case 'SOL':
      return SOL;
    case 'TON':
      return TON;
    default:
      return null;
  }
};
