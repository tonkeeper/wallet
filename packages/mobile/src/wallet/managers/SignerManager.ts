import { store } from '$store';
import { walletActions } from '$store/wallet';
import { TonRawAddress, WalletConfig, WalletType } from '$wallet/WalletTypes';
import { Cell } from '@ton/core';
import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { UnlockedVault } from '$blockchain';
import { sign } from '@ton/crypto';
import { SheetActions, navigation } from '@tonkeeper/router';
import { getCurrentRouteName } from '$navigation/imperative';
import { Signer } from '@tonkeeper/core';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { AppState, Linking } from 'react-native';
import { FC } from 'react';
import { TonTransport } from '@ton-community/ton-ledger';
import { t } from '@tonkeeper/shared/i18n';

let ledgerConfirmModalRef: FC<any> | null = null;

export const setLedgerConfirmModalRef = (ref: FC<any>) => {
  ledgerConfirmModalRef = ref;
};

export type LedgerTransaction = Parameters<TonTransport['signTransaction']>[1];

export class SignerError extends Error {}

export class SignerManager {
  private signerPromise: {
    resolve: (base64Signature: string) => void;
    reject: () => void;
  } | null = null;

  constructor(
    private tonRawAddress: TonRawAddress,
    private tonapi: TonAPI,
    private config: WalletConfig,
  ) {}

  private async signEstimateMessage(message: Cell): Promise<Buffer> {
    return sign(message.hash(), Buffer.alloc(64));
  }

  private async getPrivateKey(): Promise<Buffer> {
    const vault = await new Promise<UnlockedVault>((resolve, reject) => {
      store.dispatch(
        walletActions.walletGetUnlockedVault({
          onDone: (vault) => resolve(vault),
          onFail: (err) => reject(err),
          walletIdentifier: this.config.identifier,
        }),
      );
    });

    const keyPair = await vault.getKeyPair();

    return Buffer.from(keyPair.secretKey);
  }

  private async signWithMnemonic(message: Cell): Promise<Buffer> {
    const privateKey = await this.getPrivateKey();

    return sign(message.hash(), privateKey);
  }

  private async signWithSignerDeeplink(message: Cell): Promise<Buffer> {
    const base64Signature = await new Promise<string>(async (resolve, reject) => {
      this.signerPromise = { resolve, reject };

      try {
        let prevAppState = 'active';

        const appStateListener = AppState.addEventListener('change', (nextAppState) => {
          if (nextAppState === 'active' && prevAppState === 'background') {
            setTimeout(() => {
              if (!this.isSignerResolved) {
                this.signerPromise = null;

                reject(new CanceledActionError());
              }
              appStateListener.remove();
            }, 3000);
          }

          prevAppState = nextAppState;
        });

        await Linking.openURL(this.createSignerDeeplink(message, true));
      } catch {
        navigation.push('/signer-confirm', {
          walletIdentifier: this.config.identifier,
          deeplink: this.createSignerDeeplink(message),
          onClose: () => {
            this.signerPromise = null;

            reject(new CanceledActionError());
          },
        });
      }
    });

    return Buffer.from(base64Signature, 'base64');
  }

  private async signWithSigner(message: Cell): Promise<Buffer> {
    const base64Signature = await new Promise<string>((resolve, reject) => {
      this.signerPromise = { resolve, reject };

      navigation.push('/signer-confirm', {
        walletIdentifier: this.config.identifier,
        deeplink: this.createSignerDeeplink(message),
        onClose: () => {
          this.signerPromise = null;

          reject(new CanceledActionError());
        },
      });
    });

    return Buffer.from(base64Signature, 'base64');
  }

  public async signLedgerTransaction(transaction: LedgerTransaction): Promise<Cell> {
    const body = await new Promise<Cell>((resolve, reject) => {
      navigation.push('SheetsProvider', {
        $$action: SheetActions.ADD,
        component: ledgerConfirmModalRef,
        params: {
          transaction,
          walletIdentifier: this.config.identifier,
          onDone: resolve,
          onClose: () => {
            reject(new CanceledActionError());
          },
        },
        path: '/ledger-confirm',
      });
    });

    return body;
  }

  private createSignerDeeplink(message: Cell, addReturn?: boolean) {
    const body = message.toBoc({ idx: false }).toString('base64');

    const returnParam = addReturn ? '&return=tonkeeper://publish' : '';

    return `tonsign://?pk=${
      this.config.pubkey
    }&v=${this.config.version.toLowerCase()}&body=${body}${returnParam}`;
  }

  public get isSignerResolved() {
    return this.signerPromise === null;
  }

  public setSignerResult(base64Signature: string) {
    if (this.signerPromise) {
      this.signerPromise.resolve(base64Signature);

      this.signerPromise = null;
    }

    if (getCurrentRouteName() === '/signer-confirm') {
      navigation.goBack();
    }
  }

  public async getSigner(isEstimate?: boolean): Promise<Signer> {
    if (isEstimate) {
      return this.signEstimateMessage.bind(this);
    }

    if (this.config.type === WalletType.SignerDeeplink) {
      return this.signWithSignerDeeplink.bind(this);
    }

    if (this.config.type === WalletType.Signer) {
      return this.signWithSigner.bind(this);
    }

    if (this.config.type === WalletType.Ledger) {
      throw new SignerError(t('ledger.operation_not_supported'));
    }

    return this.signWithMnemonic.bind(this);
  }
}
