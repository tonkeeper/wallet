import { SignerType } from '$core/Send/new/core/transactionBuilder/common';
import { tk } from '$wallet';
import { Address, Cell, internal, SendMode } from '@ton/core';
import {
  Address as AddressFormatter,
  isActiveAccount,
  TransactionService,
} from '@tonkeeper/core';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';
import {
  emulateBoc,
  getTimeoutFromLiteserverSafely,
  sendBoc,
} from '@tonkeeper/shared/utils/blockchain';
import BigNumber from 'bignumber.js';
import { toNano } from '$utils';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { Toast } from '@tonkeeper/uikit';
import { Account } from '@tonkeeper/core/src/TonAPI/TonAPIGenerated';

export interface BuildTonTransferParams {
  bounce: boolean;
  recipient: string;
  sendAmount: string;
  sendMode: number;
  seqno: number;
  timeout?: number;
  payload?: Cell;
  isEstimate: boolean;
}

export async function buildTonLedgerTransferBoc(params: BuildTonTransferParams) {
  let commentPayload: string | undefined;
  if (params.payload) {
    const slice = params.payload.beginParse();
    slice.loadUint(32);
    commentPayload = slice.loadStringTail();
  }

  const transfer = await tk.wallet.signer.signLedgerTransaction({
    to: Address.parse(params.recipient),
    bounce: params.bounce,
    amount: BigInt(params.sendAmount),
    sendMode: params.sendMode ?? SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
    seqno: params.seqno,
    timeout: params.timeout ?? TransactionService.getTimeout(),
    payload:
      typeof commentPayload === 'string'
        ? {
            type: 'comment',
            text: commentPayload,
          }
        : undefined,
  });

  return TransactionService.externalMessage(tk.wallet.contract, params.seqno, transfer)
    .toBoc()
    .toString('base64');
}

export async function buildTonSignerTransferBoc(params: BuildTonTransferParams) {
  const signer = await tk.wallet.signer.getSigner(params.isEstimate);

  return TransactionService.createTransfer(tk.wallet.contract, signer, {
    timeout: params.timeout,
    seqno: params.seqno,
    sendMode: params.sendMode ?? SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
    messages: [
      internal({
        to: params.recipient,
        bounce: params.bounce,
        value: BigInt(params.sendAmount),
        body: params.payload ?? null,
      }),
    ],
  });
}

export function buildTonTransferBoc(
  signerType: SignerType,
  params: BuildTonTransferParams,
) {
  switch (signerType) {
    case SignerType.Ledger:
      return buildTonLedgerTransferBoc(params);
    case SignerType.Signer:
      return buildTonSignerTransferBoc(params);
  }
}

export interface TonTransferParams {
  recipient: string;
  sendAmountNano: bigint;
  payload?: Cell;
  isSendAll?: boolean;
  shouldAttemptWithRelayer?: boolean;
}

export async function estimateTonTransferFee(params: TonTransferParams) {
  try {
    const seqno = await getWalletSeqno();
    const timeout = await getTimeoutFromLiteserverSafely();

    let account: Account | undefined;
    try {
      account = await tk.wallet.tonapi.accounts.getAccount(params.recipient);
    } catch {}

    const boc = await buildTonTransferBoc(SignerType.Signer, {
      isEstimate: true,
      timeout,
      seqno,
      recipient: params.recipient,
      payload: params.payload,
      sendAmount: params.sendAmountNano.toString(),
      bounce:
        !account || isActiveAccount(account.status)
          ? AddressFormatter.isBounceable(params.recipient)
          : false,
      sendMode: params.isSendAll
        ? SendMode.CARRY_ALL_REMAINING_BALANCE + SendMode.IGNORE_ERRORS
        : SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
    });

    const { emulateResult, battery } = await emulateBoc(boc, undefined, false);

    const fee = new BigNumber(emulateResult.event.extra).multipliedBy(-1);

    if (!params.isSendAll && !fee.isNegative()) {
      const totalAmount = fee.plus(params.sendAmountNano.toString());
      const balance = toNano(tk.wallet.balances.state.data.ton);
      if (totalAmount.gt(balance)) {
        openInsufficientFundsModal({
          totalAmount: totalAmount.toString(),
          balance: balance.toString(),
        });
        throw new CanceledActionError();
      }
    }

    return {
      fee: fee.toString(),
      battery,
    };
  } catch {
    Toast.fail('Failed to estimate fee');
    return {
      fee: undefined,
      battery: false,
    };
  }
}

export async function sendTonBoc(params: TonTransferParams) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const signerType = tk.wallet.isLedger ? SignerType.Ledger : SignerType.Signer;

  let account: Account | undefined;
  try {
    account = await tk.wallet.tonapi.accounts.getAccount(params.recipient);
  } catch {}

  const boc = await buildTonTransferBoc(signerType, {
    isEstimate: false,
    timeout,
    seqno,
    recipient: params.recipient,
    payload: params.payload,
    sendAmount: params.sendAmountNano.toString(),
    bounce:
      !account || isActiveAccount(account.status)
        ? AddressFormatter.isBounceable(params.recipient)
        : false,
    sendMode: params.isSendAll
      ? SendMode.CARRY_ALL_REMAINING_BALANCE + SendMode.IGNORE_ERRORS
      : SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
  });

  return sendBoc(boc, params.shouldAttemptWithRelayer);
}
