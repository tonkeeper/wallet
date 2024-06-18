import { SignerType } from '$core/Send/new/core/transactionBuilder/common';
import { tk } from '$wallet';
import { Address, beginCell, Cell, internal, MessageRelaxed, SendMode } from '@ton/core';
import {
  BASE_FORWARD_AMOUNT,
  ContractService,
  ONE_TON,
  OpCodes,
  POINT_ONE_TON,
  TransactionService,
} from '@tonkeeper/core';
import { getWalletSeqno, setBalanceForEmulation } from '@tonkeeper/shared/utils/wallet';
import {
  emulateBoc,
  emulateBocWithRelayer,
  getTimeoutFromLiteserverSafely,
  sendBoc,
  sendBocToRelayer,
} from '@tonkeeper/shared/utils/blockchain';
import { toNano } from '$utils';
import { compareAddresses } from '$utils/address';
import BigNumber from 'bignumber.js';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { WalletContractFeature, WalletContractFeatures } from '$wallet/WalletTypes';
import { config } from '$config';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import { Toast } from '@tonkeeper/uikit';

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

export const gaslessInternal = async (
  walletAddress: string,
  jettonTransferAmount: bigint,
  amount: bigint,
) => {
  const excessesAccount = await tk.wallet.battery.getExcessesAccount();
  const batteryAddress = Address.parse(excessesAccount);
  return internal({
    to: Address.parse(walletAddress),
    bounce: true,
    value: jettonTransferAmount ?? ONE_TON,
    body: ContractService.createJettonTransferBody({
      jettonAmount: amount,
      forwardAmount: 0,
      receiverAddress: batteryAddress,
      excessesAddress: batteryAddress,
      forwardBody: beginCell().storeUint(OpCodes.TK_RELAYER_FEE, 32).endCell(),
    }),
  });
};

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

export async function buildJettonSignerTransferBoc(
  params: BuildJettonTransferParams,
  authType?: 'internal' | 'external',
  additionalMessages?: MessageRelaxed[],
) {
  const signer = await tk.wallet.signer.getSigner(params.isEstimate);

  return TransactionService.createTransfer(
    tk.wallet.contract,
    signer,
    {
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
        ...(additionalMessages ? additionalMessages : []),
      ],
    },
    authType,
  );
}

export function buildJettonTransferBoc(
  signerType: SignerType,
  params: BuildJettonTransferParams,
  type?: 'internal' | 'external',
) {
  switch (signerType) {
    case SignerType.Ledger:
      return buildJettonLedgerTransferBoc(params);
    case SignerType.Signer:
      return buildJettonSignerTransferBoc(params, type);
  }
}

export interface JettonTransferParams {
  preferGasless?: boolean;
  isSendAll?: boolean;
  forceGasless?: boolean;
  recipient: string;
  sendAmountNano: bigint;
  jetton: JettonBalanceModel;
  jettonTransferAmount?: bigint;
  payload?: Cell;
  shouldAttemptWithRelayer?: boolean;
}

export async function estimateJettonTransferFee(
  params: JettonTransferParams,
  _seqno?: number,
  _timeout?: number,
) {
  try {
    const seqno = _seqno ?? (await getWalletSeqno());
    const timeout = _timeout ?? (await getTimeoutFromLiteserverSafely());
    const balance = toNano(tk.wallet.balances.state.data.ton);

    const isPreferGasless = params.preferGasless ?? true;

    const boc = await buildJettonTransferBoc(
      SignerType.Signer,
      {
        timeout,
        seqno,
        recipient: params.recipient,
        isEstimate: true,
        jettonTransferAmount: params.jettonTransferAmount ?? ONE_TON,
        jettonAmount: params.sendAmountNano,
        jettonWalletAddress: params.jetton.walletAddress,
        payload: params.payload,
      },
      params.shouldAttemptWithRelayer ? 'internal' : 'external',
    );

    let emulateResponse: { emulateResult: MessageConsequences; battery: boolean };

    if (params.shouldAttemptWithRelayer) {
      try {
        emulateResponse = await emulateBocWithRelayer(
          boc,
          compareAddresses(params.recipient, await tk.wallet.battery.getFundReceiver()),
        );
      } catch {
        return estimateJettonTransferFee(
          { ...params, shouldAttemptWithRelayer: false },
          seqno,
          timeout,
        );
      }
    } else {
      emulateResponse = await emulateBoc(
        boc,
        [setBalanceForEmulation(toNano('2'))], // Emulate with higher balance to calculate fair amount to send
        false,
      );
    }

    const isWalletSupportsGasless =
      WalletContractFeatures[tk.wallet.config.version][WalletContractFeature.GASLESS];

    let supportsGasless = false;
    if (
      !emulateResponse.battery &&
      isWalletSupportsGasless &&
      config.get('gasless_enabled')
    ) {
      let isJettonSupportsGasless = false;
      try {
        const rechargeMethods = await tk.wallet.battery.getRechargeMethods();

        isJettonSupportsGasless = rechargeMethods.some(
          (method) =>
            method.support_gasless &&
            compareAddresses(method.jetton_master, params.jetton.jettonAddress),
        );
      } catch {}

      supportsGasless = !!tk.wallet.tonProof.tonProofToken && isJettonSupportsGasless;

      if (supportsGasless && (isPreferGasless || params.forceGasless)) {
        const gaslessBoc = await buildJettonSignerTransferBoc(
          {
            timeout,
            seqno,
            recipient: params.recipient,
            isEstimate: true,
            jettonTransferAmount: POINT_ONE_TON,
            jettonAmount: params.isSendAll ? BigInt(1) : params.sendAmountNano,
            jettonWalletAddress: params.jetton.walletAddress,
            payload: params.payload,
            excessesAccount: await tk.wallet.battery.getExcessesAccount(),
          },
          'internal',
          [await gaslessInternal(params.jetton.walletAddress, POINT_ONE_TON, BigInt(1))],
        );

        const estimatedCost = await tk.wallet.battery.estimateGaslessCost({
          jettonMaster: params.jetton.jettonAddress,
          payload: gaslessBoc,
          battery: false,
        });

        if (
          estimatedCost?.commission &&
          (params.isSendAll ||
            new BigNumber(
              toNano(params.jetton.balance, params.jetton.metadata.decimals ?? 9),
            ).isGreaterThanOrEqualTo(
              new BigNumber(estimatedCost?.commission).plus(
                params.sendAmountNano.toString(),
              ),
            ))
        ) {
          return {
            fee: estimatedCost.commission,
            customFeeCurrency: {
              jetton_master: params.jetton.jettonAddress,
              decimals: params.jetton.metadata.decimals,
              symbol: params.jetton.metadata.symbol,
            },
            battery: false,
            gasless: true,
            isForcedGasless: params.forceGasless,
            supportsGasless,
          };
        }
        supportsGasless = false;
      }
    }

    const feeToCalculate = new BigNumber(emulateResponse.emulateResult.event.extra)
      .multipliedBy(-1)
      .isNegative()
      ? new BigNumber(BASE_FORWARD_AMOUNT.toString())
      : new BigNumber(emulateResponse.emulateResult.event.extra)
          .multipliedBy(-1)
          .plus(BASE_FORWARD_AMOUNT.toString());

    if (!emulateResponse.battery && feeToCalculate.gt(balance)) {
      if (supportsGasless && !params.preferGasless && !params.forceGasless) {
        // Retry emulation with forced gasless
        return estimateJettonTransferFee(
          { ...params, forceGasless: true },
          seqno,
          timeout,
        );
      }
      openInsufficientFundsModal({
        totalAmount: feeToCalculate.toString(),
        balance: balance.toString(),
      });
      throw new CanceledActionError();
    }

    return {
      fee: new BigNumber(emulateResponse.emulateResult.event.extra)
        .multipliedBy(-1)
        .toString(),
      battery: emulateResponse.battery,
      gasless: false,
      supportsGasless,
    };
  } catch {
    Toast.fail('Failed to estimate fee');
    return {
      fee: undefined,
      battery: false,
    };
  }
}

export async function sendJettonBoc(params: JettonTransferParams) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const signerType = tk.wallet.isLedger ? SignerType.Ledger : SignerType.Signer;

  const boc = await buildJettonTransferBoc(
    signerType,
    {
      isEstimate: false,
      timeout,
      seqno,
      recipient: params.recipient,
      jettonTransferAmount: params.jettonTransferAmount ?? ONE_TON,
      jettonAmount: params.sendAmountNano,
      jettonWalletAddress: params.jetton.walletAddress,
      payload: params.payload,
      excessesAccount: params.shouldAttemptWithRelayer
        ? await tk.wallet.battery.getExcessesAccount()
        : undefined,
    },
    params.shouldAttemptWithRelayer ? 'internal' : 'external',
  );

  return sendBoc(boc, params.shouldAttemptWithRelayer);
}

export async function sendGaslessJettonBoc(
  params: Omit<
    JettonTransferParams,
    'shouldAttemptWithRelayer' | 'jettonTransferAmount'
  > & { commission: bigint },
) {
  const seqno = await getWalletSeqno();
  const timeout = await getTimeoutFromLiteserverSafely();

  const boc = await buildJettonSignerTransferBoc(
    {
      isEstimate: false,
      timeout,
      seqno,
      recipient: params.recipient,
      jettonTransferAmount: POINT_ONE_TON,
      jettonAmount: params.sendAmountNano,
      jettonWalletAddress: params.jetton.walletAddress,
      payload: params.payload,
      excessesAccount: await tk.wallet.battery.getExcessesAccount(),
    },
    'internal',
    [
      await gaslessInternal(
        params.jetton.walletAddress,
        POINT_ONE_TON,
        params.commission,
      ),
    ],
  );

  return sendBocToRelayer(boc);
}
