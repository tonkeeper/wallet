import TonWeb from 'tonweb';

import { BaseProvider } from '$store/nfts/manager/providers/base';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { JettonBalanceModel, JettonMetadata } from '$store/models';
import _ from 'lodash';
import { fromNano } from '$utils';
import { proxyMedia } from '$utils/proxyMedia';
import {
  JettonsApi,
  Configuration,
  AccountsApi,
  JettonBalance,
} from '@tonkeeper/core/src/legacy';

export class TonProvider extends BaseProvider {
  public readonly name = 'TonProvider';

  async loadJettonInfo(jettonAddress: string): Promise<JettonMetadata> {
    const endpoint = getServerConfig('tonapiV2Endpoint');

    const jettonsApi = new JettonsApi(
      new Configuration({
        basePath: endpoint,
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
        },
      }),
    );

    const jettonInfo = await jettonsApi.getJettonInfo({ accountId: jettonAddress });
    const metadata = jettonInfo.metadata as any;

    return {
      ...(metadata ?? {}),
      decimals:
        metadata?.decimals && !_.isNil(metadata?.decimals)
          ? parseInt(metadata.decimals)
          : 9, // > If not specified, 9 is used by default
    };
  }

  async load(): Promise<JettonBalanceModel[]> {
    const endpoint = getServerConfig('tonapiV2Endpoint');

    const accountsApi = new AccountsApi(
      new Configuration({
        basePath: endpoint,
        headers: {
          Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
        },
      }),
    );

    const jettonBalances = await accountsApi.getJettonsBalances({
      accountId: this.address,
    });

    const balances = jettonBalances.balances;

    if (!_.isArray(balances)) {
      return [];
    }

    return balances.map((balance) => this.map(balance));
  }

  private map(jettonBalance: JettonBalance): JettonBalanceModel {
    const metadata = jettonBalance.jetton;
    const decimals = metadata && !_.isNil(metadata?.decimals) ? metadata.decimals : 9; // > If not specified, 9 is used by default
    const jettonAddress = new TonWeb.utils.Address(jettonBalance.jetton.address).toString(
      true,
      true,
      true,
    );
    const walletAddress = new TonWeb.utils.Address(
      jettonBalance.walletAddress.address,
    ).toString(true, true, true);
    return {
      currency: CryptoCurrencies.Ton,
      jettonAddress,
      metadata: {
        ...((metadata as any) ?? {}),
        decimals,
        image: metadata?.image && proxyMedia(metadata.image, 512, 512),
        symbol: metadata?.symbol,
      },
      walletAddress,
      verification: jettonBalance.jetton.verification as any,
      balance: fromNano(jettonBalance.balance, decimals),
    };
  }

  filterJetton(jetton: JettonBalanceModel): boolean {
    return jetton.currency === CryptoCurrencies.Ton;
  }
}
