import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { Address, Ton } from '$libs/Ton';
import { encodeBytes } from '$utils/base64';
import { PoolInfo } from '@tonkeeper/core';
import BN from 'bn.js';
import TonWeb from 'tonweb';
import { StakingTransactionType } from './types';
import { JettonBalanceModel } from '$store/models';
import BigNumber from 'bignumber.js';

const { Cell } = TonWeb.boc;

export function getRandomQueryId() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export const createWhalesAddStakeCommand = async () => {
  const command = new Cell();
  command.bits.writeUint(2077040623, 32);
  command.bits.writeUint(getRandomQueryId(), 64); // Query ID
  command.bits.writeCoins(100000); // Gas

  return encodeBytes(await command.toBoc());
};

export const createWhalesWithdrawStakeCell = async (amount: BN) => {
  const command = new Cell();
  command.bits.writeUint(3665837821, 32);
  command.bits.writeUint(getRandomQueryId(), 64); // Query ID
  command.bits.writeCoins(100000); // Gas
  command.bits.writeCoins(amount); // Amount

  return encodeBytes(await command.toBoc());
};

export const createLiquidTfAddStakeCommand = async () => {
  const command = new Cell();
  command.bits.writeUint(0x47d54391, 32);
  command.bits.writeUint(getRandomQueryId(), 64); // Query ID

  return encodeBytes(await command.toBoc());
};

export const createLiquidTfWithdrawStakeCell = async (amount: BN, address: string) => {
  const customPayload = new Cell();
  customPayload.bits.writeUint(1, 1);
  customPayload.bits.writeUint(0, 1);

  const payload = new Cell();
  payload.bits.writeUint(0x595f07bc, 32);
  payload.bits.writeUint(getRandomQueryId(), 64); // Query ID
  payload.bits.writeCoins(amount); // Amount
  payload.bits.writeAddress(new Address(address));
  payload.bits.writeBit(1);
  payload.refs.push(customPayload);

  return encodeBytes(await payload.toBoc());
};

export const createTfAddStakeCommand = async () => {
  const command = new Cell();
  command.bits.writeUint(0, 32);
  command.bits.writeString('d');

  return encodeBytes(await command.toBoc());
};

export const createTfWithdrawStakeCell = async () => {
  const command = new Cell();
  command.bits.writeUint(0, 32);
  command.bits.writeString('w');

  return encodeBytes(await command.toBoc());
};

export const getStakeSignRawMessage = async (
  pool: PoolInfo,
  amount: BN,
  transactionType: StakingTransactionType,
  responseAddress: string,
  isSendAll?: boolean,
  stakingJetton?: JettonBalanceModel,
): Promise<SignRawMessage> => {
  const withdrawalFee = getWithdrawalFee(pool);

  const address = new Address(
    stakingJetton && transactionType !== StakingTransactionType.DEPOSIT
      ? stakingJetton.walletAddress
      : pool.address,
  ).format({ bounce: true });

  if (pool.implementation === 'whales') {
    const payload =
      transactionType === StakingTransactionType.DEPOSIT
        ? await createWhalesAddStakeCommand()
        : await createWhalesWithdrawStakeCell(isSendAll ? Ton.toNano(0) : amount);

    return {
      address,
      amount: transactionType === StakingTransactionType.DEPOSIT ? amount : withdrawalFee,
      payload,
    };
  }

  if (pool.implementation === 'liquidTF') {
    const payload =
      transactionType === StakingTransactionType.DEPOSIT
        ? await createLiquidTfAddStakeCommand()
        : await createLiquidTfWithdrawStakeCell(
            isSendAll ? Ton.toNano(0) : amount,
            responseAddress,
          );

    const amountWithFee = Ton.toNano(
      new BigNumber(Ton.fromNano(withdrawalFee))
        .plus(Ton.fromNano(withdrawalFee))
        .toString(),
    );

    const depositAmount =
      pool.implementation === 'liquidTF' && !isSendAll ? amountWithFee : amount;

    return {
      address,
      amount:
        transactionType === StakingTransactionType.DEPOSIT
          ? depositAmount
          : withdrawalFee,
      payload,
    };
  }

  if (pool.implementation === 'tf') {
    const payload =
      transactionType === StakingTransactionType.DEPOSIT
        ? await createTfAddStakeCommand()
        : await createTfWithdrawStakeCell();

    return {
      address,
      amount: transactionType === StakingTransactionType.DEPOSIT ? amount : withdrawalFee,
      payload,
    };
  }

  throw new Error('not implemented yet');
};

export const getWithdrawalFee = (pool: PoolInfo): BN => {
  if (pool.implementation === 'whales') {
    return Ton.toNano('0.2');
  }

  if (['tf', 'liquidTF'].includes(pool.implementation)) {
    return Ton.toNano('1');
  }

  return Ton.toNano(0);
};
