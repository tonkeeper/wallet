import { Storage, State } from '@tonkeeper/core';
import { TonProofManager } from '$wallet/managers/TonProofManager';
import { config } from '$config';

export type LocalScamState = Record<string, boolean>;

export class LocalScamManager {
  static readonly INITIAL_STATE: LocalScamState = {};
  public state = new State<LocalScamState>(LocalScamManager.INITIAL_STATE);

  constructor(
    private persistPath: string,
    private rawAddress: string,
    private tonProof: TonProofManager,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: (state) => state,
      storage: this.storage,
      key: `${this.persistPath}/local-scam`,
    });
  }

  public async add(txHash: string, commentToReport: string) {
    fetch(`${config.get('scamEndpoint')}/v1/report/tx/${txHash}`, {
      method: 'POST',
      body: JSON.stringify({ comment: commentToReport, recipient: this.rawAddress }),
      headers: {
        'Content-Type': 'application/json',
        'X-TonConnect-Auth': this.tonProof.tonProofToken ?? '',
      },
    }).catch((e) => console.warn(e));
    return this.state.set((state) => ({ ...state, [txHash]: true }));
  }

  public async remove(txHash: string) {
    return this.state.set((state) => ({ ...state, [txHash]: false }));
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async clear() {
    return this.state.clear();
  }
}
