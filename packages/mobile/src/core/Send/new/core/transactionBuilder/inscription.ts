import { tk } from '$wallet';
import { Cell, comment, toNano } from '@ton/core';
import { OperationEnum, TypeEnum } from '@tonkeeper/core/src/TonAPI';
import {
  estimateTonTransferFee,
  sendTonBoc,
} from '$core/Send/new/core/transactionBuilder/ton';

export interface InscriptionTransferParams {
  recipient: string;
  sendAmountNano: bigint;
  payload?: Cell;
  isSendAll?: boolean;
  shouldAttemptWithRelayer?: boolean;
  inscription: {
    type: TypeEnum;
    ticker: string;
  };
}

export async function estimateInscriptionTransferFee(params: InscriptionTransferParams) {
  let commentPayload: string | undefined;
  if (params.payload) {
    const slice = params.payload.beginParse();
    slice.loadUint(32);
    commentPayload = slice.loadStringTail();
  }

  const opTemplate = await tk.wallet.tonapi.experimental.getInscriptionOpTemplate({
    destination: params.recipient,
    amount: params.sendAmountNano.toString(),
    who: tk.wallet.address.ton.raw,
    type: params.inscription.type,
    operation: OperationEnum.Transfer,
    comment: commentPayload,
    ticker: params.inscription.ticker,
  });

  return estimateTonTransferFee({
    isSendAll: false,
    recipient: opTemplate.destination,
    sendAmountNano: toNano(0.05),
    payload: comment(opTemplate.comment),
    shouldAttemptWithRelayer: false,
  });
}

export async function sendInscriptionBoc(params: InscriptionTransferParams) {
  let commentPayload: string | undefined;
  if (params.payload) {
    const slice = params.payload.beginParse();
    slice.loadUint(32);
    commentPayload = slice.loadStringTail();
  }

  const opTemplate = await tk.wallet.tonapi.experimental.getInscriptionOpTemplate({
    destination: params.recipient,
    amount: params.sendAmountNano.toString(),
    who: tk.wallet.address.ton.raw,
    type: params.inscription.type,
    operation: OperationEnum.Transfer,
    comment: commentPayload,
    ticker: params.inscription.ticker,
  });

  return sendTonBoc({
    isSendAll: false,
    recipient: opTemplate.destination,
    sendAmountNano: toNano(0.05),
    payload: comment(opTemplate.comment),
    shouldAttemptWithRelayer: false,
  });
}
