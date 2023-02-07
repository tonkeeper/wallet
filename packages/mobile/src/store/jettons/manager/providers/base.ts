import { JettonBalanceModel, JettonMetadata } from '$store/models';

export interface BaseProviderInterface {
  load(): Promise<JettonBalanceModel[]>;
  loadJettonInfo(address: string): Promise<JettonMetadata>;
  name: string;
}

export abstract class BaseProvider implements BaseProviderInterface {
  abstract name: string;
  readonly address: string;
  nextFrom: string | null = null;
  canMore = true;

  constructor(address: string) {
    this.address = address;
  }

  load(): Promise<JettonBalanceModel[]> {
    throw new Error('load is not implemented');
  }

  loadJettonInfo(): Promise<JettonMetadata> {
    throw new Error('loadJettonInfo is not implemented');
  }
}
