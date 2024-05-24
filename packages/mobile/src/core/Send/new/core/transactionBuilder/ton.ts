import { SignerType } from '$core/Send/new/core/transactionBuilder/common';
import { tk } from '$wallet';
import { Address, Cell, internal, SendMode } from '@ton/core';
import { Address as AddressFormatter, TransactionService } from '@tonkeeper/core';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';
import {
  emulateBoc,
  getTimeoutFromLiteserverSafely,
  sendBoc,
} from '@tonkeeper/shared/utils/blockchain';
import BigNumber from 'bignumber.js';
import { toNano as tonCoreToNano } from '@ton/core/dist/utils/convert';

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
    amount: tonCoreToNano(params.sendAmount),
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
        value: params.sendAmount,
        body: params.payload,
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
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const boc = await buildTonTransferBoc(SignerType.Signer, {
    isEstimate: true,
    timeout,
    seqno,
    recipient: params.recipient,
    payload: params.payload,
    sendAmount: params.sendAmountNano.toString(),
    bounce: AddressFormatter.isBounceable(params.recipient),
    sendMode: params.isSendAll
      ? 128
      : SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
  });

  const { emulateResult, battery } = await emulateBoc(boc, undefined, false);

  return {
    fee: new BigNumber(emulateResult.event.extra).multipliedBy(-1).toString(),
    battery,
  };
}

export async function sendTonBoc(params: TonTransferParams) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const signerType = tk.wallet.isLedger ? SignerType.Ledger : SignerType.Signer;

  console.log({
    isEstimate: false,
    timeout,
    seqno,
    recipient: params.recipient,
    payload: params.payload,
    sendAmount: params.sendAmountNano.toString(),
    bounce: AddressFormatter.isBounceable(params.recipient),
    sendMode: params.isSendAll
      ? 128
      : SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
  });

  const boc = await buildTonTransferBoc(signerType, {
    isEstimate: false,
    timeout,
    seqno,
    recipient: params.recipient,
    payload: params.payload,
    sendAmount: params.sendAmountNano.toString(),
    bounce: AddressFormatter.isBounceable(params.recipient),
    sendMode: params.isSendAll
      ? 128
      : SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
  });

  return sendBoc(boc, params.shouldAttemptWithRelayer);
}
