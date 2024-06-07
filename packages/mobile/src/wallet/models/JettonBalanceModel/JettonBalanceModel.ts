import { Address, AmountFormatter } from '@tonkeeper/core';
import { JettonBalance, JettonVerificationType } from '@tonkeeper/core/src/TonAPI';
import { JettonMetadata, JettonVerification } from './types';

export class JettonBalanceModel {
  // indicates that user has no interaction with jetton yet
  uninit_jetton_wallet?: boolean;
  metadata: JettonMetadata;
  balance: string;
  jettonAddress: string;
  walletAddress: string;
  verification: JettonVerification;
  lock?: { amount: string; till: number };

  constructor(jettonBalance: JettonBalance & { uninit_jetton_wallet?: boolean }) {
    this.uninit_jetton_wallet = jettonBalance.uninit_jetton_wallet;
    this.metadata = jettonBalance.jetton;
    this.balance = AmountFormatter.fromNanoStatic(
      jettonBalance.balance,
      jettonBalance.jetton.decimals,
    );

    this.lock = jettonBalance.lock && {
      amount: AmountFormatter.fromNanoStatic(
        jettonBalance.lock.amount,
        jettonBalance.jetton.decimals,
      ),
      till: jettonBalance.lock.till,
    };
    this.jettonAddress = new Address(jettonBalance.jetton.address).toFriendly();
    this.walletAddress = new Address(jettonBalance.wallet_address.address).toFriendly();
    this.verification = jettonBalance.jetton
      .verification as unknown as JettonVerification;

    if (jettonBalance.jetton.verification === JettonVerificationType.Blacklist) {
      this.metadata.symbol = 'FAKE';
    }
  }
}
