import axios from 'axios';
import TonWeb from 'tonweb';

import { BaseProvider } from '$store/nfts/manager/providers/base';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { JettonBalanceModel, JettonMetadata } from '$store/models';
import _ from 'lodash';
import { fromNano } from '$utils';
import { proxyMedia } from '$utils/proxyMedia';
import DeviceInfo from 'react-native-device-info';

export class TonProvider extends BaseProvider {
  public readonly name = 'TonProvider';

  async loadJettonInfo(jettonAddress: string): Promise<JettonMetadata> {
    const endpoint = getServerConfig('tonapiIOEndpoint');

    const resp: any = await axios.get(`${endpoint}/v1/jetton/getInfo`, {
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
      params: {
        account: jettonAddress,
      },
    });
    const metadata = resp.data.metadata;

    return {
      ...metadata,
      decimals: !_.isNil(metadata?.decimals) ? parseInt(metadata.decimals) : 9, // > If not specified, 9 is used by default
    };
  }

  async load(): Promise<JettonBalanceModel[]> {
    try {
      const endpoint = getServerConfig('tonapiIOEndpoint');

      const resp: any = await axios.get(`${endpoint}/v1/jetton/getBalances`, {
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
          Build: DeviceInfo.getBuildNumber(),
        },
        params: {
          account: this.address,
        },
      });

      const jettonBalances = resp.data.balances;

      if (!_.isArray(jettonBalances)) {
        return [];
      }

      return jettonBalances.map((balance) => this.map(balance));
    } catch (e) {
      return [];
    }
  }

  private map(jettonBalance: any): JettonBalanceModel {
    const metadata = jettonBalance?.metadata;
    const decimals = !_.isNil(metadata?.decimals) ? parseInt(metadata.decimals) : 9; // > If not specified, 9 is used by default
    const jettonAddress = new TonWeb.utils.Address(jettonBalance.jetton_address).toString(
      true,
      true,
      true,
    );
    const walletAddress = new TonWeb.utils.Address(
      jettonBalance.wallet_address.address,
    ).toString(true, true, true);
    return {
      currency: CryptoCurrencies.Ton,
      jettonAddress,
      metadata: {
        ...metadata,
        decimals,
        image: metadata?.image && proxyMedia(metadata.image, 512, 512),
        symbol: metadata?.symbol || (metadata?.name && metadata.name.toUpperCase().slice(0, 3))
      },
      walletAddress,
      verification: jettonBalance.verification,
      balance: fromNano(jettonBalance.balance, decimals),
    };
  }

  filterJetton(jetton: JettonBalanceModel): boolean {
    return jetton.currency === CryptoCurrencies.Ton;
  }
}
