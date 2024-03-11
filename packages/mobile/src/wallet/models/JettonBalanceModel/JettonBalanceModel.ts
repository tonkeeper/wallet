import { Address, AmountFormatter } from '@tonkeeper/core';
import { JettonBalance } from '@tonkeeper/core/src/TonAPI';
import { JettonMetadata, JettonVerification } from './types';

export class JettonBalanceModel {
  metadata: JettonMetadata;
  balance: string;
  jettonAddress: string;
  walletAddress: string;
  verification: JettonVerification;

  constructor(jettonBalance: JettonBalance) {
    this.metadata = jettonBalance.jetton;
    this.balance = AmountFormatter.fromNanoStatic(
      jettonBalance.balance,
      jettonBalance.jetton.decimals,
    );
    this.jettonAddress = new Address(jettonBalance.jetton.address).toFriendly();
    this.walletAddress = new Address(jettonBalance.wallet_address.address).toFriendly();
    this.verification = jettonBalance.jetton
      .verification as unknown as JettonVerification;
  }
}
