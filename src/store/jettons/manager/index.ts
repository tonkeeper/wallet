import { BaseProviderInterface } from '$store/jettons/manager/providers/base';
import { TonProvider } from '$store/jettons/manager/providers/ton';
import { JettonBalanceModel, JettonMetadata } from '$store/models';

export interface JettonsManagerOptions {
  walletName: string;
  tonAddress: string;
}

export class JettonsManager {
  private providers: BaseProviderInterface[];

  constructor(options: JettonsManagerOptions) {
    this.providers = [new TonProvider(options.tonAddress)];
  }

  async fetchJettonMetadata(jettonAddress: string): Promise<JettonMetadata> {
    // @ts-ignore
    return await this.providers[0].loadJettonInfo(jettonAddress);
  }

  async fetch(): Promise<JettonBalanceModel[]> {
    // @ts-ignore
    let responses: any = await Promise.all([
      ...this.providers.map((provider) => provider.load()),
    ]);

    const jettonsToReturn: JettonBalanceModel[] = [];

    for (let jettons of responses) {
      for (let jetton of jettons) {
        jettonsToReturn.push(jetton);
      }
    }

    return jettonsToReturn;
  }
}
