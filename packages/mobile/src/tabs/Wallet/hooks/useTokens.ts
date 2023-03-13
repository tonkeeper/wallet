import { useJettonBalances } from "$hooks";
import { jettonsSelector } from "$store/jettons";
import { formatAmountAndLocalize } from "$utils";
import { useSelector } from "react-redux";
import TonWeb from "tonweb";

type WalletAddress = {
  friendlyAddress: string;
  rawAddress: string;
  version: WalletVersion;
}

type WalletVersion = 'v3R1' | 'v4R2';

type TokenInfo = {
  address: WalletAddress;
  name?: string;
  symbol?: string;
  description?: string;
  iconUrl?: string;
  decimals: number;
  quantity: {
    value: string;
    formatted: string;
  };
}

export const useTonkens = (): { 
  list: TokenInfo[];
  canEdit: boolean;
} => {
  const { jettonBalances: allJettonBalances } = useSelector(jettonsSelector);
  const jettonBalances = useJettonBalances();

  const tonkens = jettonBalances.map((item) => {
    const tokenInfo: TokenInfo = {
      address: {
        friendlyAddress: new TonWeb.utils.Address(item.jettonAddress).toString(true, true, true),
        rawAddress: item.jettonAddress,
        version: 'v3R1',
      },
      name: item.metadata.name,
      symbol: item.metadata.symbol,
      description: item.metadata.description,
      iconUrl: item.metadata.image,
      decimals: item.metadata.decimals,
      quantity: {
        value: item.balance,
        formatted: formatAmountAndLocalize(item.balance, 2),
      }
    };

    return tokenInfo;
  }) as TokenInfo[];

  return {
    list: tonkens,
    canEdit: allJettonBalances.length > 0
  }
}