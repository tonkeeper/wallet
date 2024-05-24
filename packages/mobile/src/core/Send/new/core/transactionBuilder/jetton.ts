import { SignerType } from '$core/Send/new/core/transactionBuilder/common';
import { tk } from '$wallet';
import { Address, Cell, internal, SendMode } from '@ton/core';
import {
  BASE_FORWARD_AMOUNT,
  ContractService,
  ONE_TON,
  TransactionService,
} from '@tonkeeper/core';
import { getWalletSeqno, setBalanceForEmulation } from '@tonkeeper/shared/utils/wallet';
import {
  emulateBoc,
  getTimeoutFromLiteserverSafely,
  sendBoc,
} from '@tonkeeper/shared/utils/blockchain';
import { toNano } from '$utils';
import { BatterySupportedTransaction } from '$wallet/managers/BatteryManager';
import { compareAddresses } from '$utils/address';
import BigNumber from 'bignumber.js';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { WalletContractFeature, WalletContractFeatures } from '$wallet/WalletTypes';
import { config } from '$config';

export interface BuildJettonTransferParams {
  jettonWalletAddress: string;
  jettonTransferAmount: bigint;
  jettonAmount: bigint;
  recipient: string;
  excessesAccount?: string;
  payload: Cell | undefined;
  seqno: number;
  timeout: number;
  isEstimate: boolean;
}

export async function buildJettonLedgerTransferBoc(params: BuildJettonTransferParams) {
  const transfer = await tk.wallet.signer.signLedgerTransaction({
    to: Address.parse(params.jettonWalletAddress),
    bounce: true,
    amount: params.jettonTransferAmount,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    seqno: params.seqno,
    timeout: params.timeout ?? TransactionService.getTimeout(),
    payload: {
      type: 'jetton-transfer',
      queryId: ContractService.getWalletQueryId(),
      amount: params.jettonAmount,
      destination: Address.parse(params.recipient),
      responseDestination: Address.parse(
        params.excessesAccount ?? tk.wallet.address.ton.raw,
      ),
      forwardAmount: BigInt(1),
      forwardPayload: params.payload ?? null,
      customPayload: null,
    },
  });
  return TransactionService.externalMessage(tk.wallet.contract, params.seqno, transfer)
    .toBoc()
    .toString('base64');
}

export async function buildJettonSignerTransferBoc(params: BuildJettonTransferParams) {
  const signer = await tk.wallet.signer.getSigner(params.isEstimate);

  return TransactionService.createTransfer(tk.wallet.contract, signer, {
    timeout: params.timeout,
    seqno: params.seqno,
    messages: [
      internal({
        to: Address.parse(params.jettonWalletAddress),
        bounce: true,
        value: params.jettonTransferAmount,
        body: ContractService.createJettonTransferBody({
          jettonAmount: params.jettonAmount,
          receiverAddress: params.recipient,
          excessesAddress: params.excessesAccount ?? tk.wallet.address.ton.raw,
          forwardBody: params.payload,
        }),
      }),
    ],
  });
}

export function buildJettonTransferBoc(
  signerType: SignerType,
  params: BuildJettonTransferParams,
) {
  switch (signerType) {
    case SignerType.Ledger:
      return buildJettonLedgerTransferBoc(params);
    case SignerType.Signer:
      return buildJettonSignerTransferBoc(params);
  }
}

export interface JettonTransferParams {
  preferGasless?: boolean;
  forceGasless?: boolean;
  recipient: string;
  sendAmountNano: bigint;
  jetton: JettonBalanceModel;
  jettonTransferAmount?: bigint;
  payload?: Cell;
  shouldAttemptWithRelayer?: boolean;
}

export async function estimateJettonTransferFee(params: JettonTransferParams) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const balance = toNano(tk.wallet.balances.state.data.ton);

  const isPreferGasless = params.preferGasless ?? true;

  const boc = await buildJettonTransferBoc(SignerType.Signer, {
    timeout,
    seqno,
    recipient: params.recipient,
    isEstimate: true,
    jettonTransferAmount: params.jettonTransferAmount ?? ONE_TON,
    jettonAmount: params.sendAmountNano,
    jettonWalletAddress: params.jetton.walletAddress,
    payload: params.payload,
  });

  const { emulateResult, battery } = await emulateBoc(
    boc,
    [setBalanceForEmulation(toNano('2'))],
    tk.wallet.battery.state.data.supportedTransactions[
      BatterySupportedTransaction.Jetton
    ],
    compareAddresses(params.recipient, tk.wallet.battery.fundReceiver),
  );

  const isWalletSupportsGasless =
    WalletContractFeatures[tk.wallet.config.version][WalletContractFeature.GASLESS];

  let isJettonSupportsGasless = false;
  if (!battery && isWalletSupportsGasless && config.get('gasless_enabled')) {
    try {
      const rechargeMethods = await tk.wallet.battery.fetchRechargeMethods();

      isJettonSupportsGasless = rechargeMethods.some(
        (method) =>
          method.support_gasless &&
          compareAddresses(method.jetton_master, params.jetton.jettonAddress),
      );
    } catch {}

    if (isPreferGasless || params.forceGasless) {
      const estimatedCost = await tk.wallet.battery.estimateGaslessCost({
        jettonMaster: params.jetton.jettonAddress,
        amount: params.sendAmountNano.toString(),
        toAddress: params.recipient,
        battery: false,
      });

      if (estimatedCost?.commission) {
        return {
          fee: toNano(estimatedCost.commission, params.jetton.metadata.decimals),
          customFeeCurrency: {
            jetton_master: params.jetton.jettonAddress,
            decimals: params.jetton.metadata.decimals,
            symbol: params.jetton.metadata.symbol,
          },
          battery: false,
          gasless: true,
          isForcedGasless: params.forceGasless,
          supportsGasless: isJettonSupportsGasless,
        };
      }
    }
  }

  const feeToCalculate = new BigNumber(emulateResult.event.extra)
    .multipliedBy(-1)
    .isNegative()
    ? new BigNumber(BASE_FORWARD_AMOUNT.toString())
    : new BigNumber(emulateResult.event.extra)
        .multipliedBy(-1)
        .plus(BASE_FORWARD_AMOUNT.toString());

  if (!battery && feeToCalculate.gt(balance)) {
    if (isJettonSupportsGasless && !params.preferGasless) {
      // Retry emulation with forced gasless
      return estimateJettonTransferFee({ ...params, forceGasless: true });
    }
    openInsufficientFundsModal({
      totalAmount: feeToCalculate.toString(),
      balance: balance.toString(),
    });
    throw new CanceledActionError();
  }

  return {
    fee: new BigNumber(emulateResult.event.extra).multipliedBy(-1).toString(),
    battery,
    gasless: false,
    supportsGasless: isJettonSupportsGasless,
  };
}

export async function sendJettonBoc(params: JettonTransferParams) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const signerType = tk.wallet.isLedger ? SignerType.Ledger : SignerType.Signer;

  const boc = await buildJettonTransferBoc(signerType, {
    isEstimate: false,
    timeout,
    seqno,
    recipient: params.recipient,
    jettonTransferAmount: params.jettonTransferAmount ?? ONE_TON,
    jettonAmount: params.sendAmountNano,
    jettonWalletAddress: params.jetton.walletAddress,
    payload: params.payload,
    excessesAccount: params.shouldAttemptWithRelayer
      ? tk.wallet.battery.fundReceiver
      : undefined,
  });

  return sendBoc(boc, params.shouldAttemptWithRelayer);
}
