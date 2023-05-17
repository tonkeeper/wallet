import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { Address, Ton } from '$libs/Ton';
import { encodeBytes } from '$utils/base64';
import { PoolInfo } from '@tonkeeper/core';
import BN from 'bn.js';
import TonWeb from 'tonweb';
import { StakingTransactionType } from './types';

const { Cell } = TonWeb.boc;

export function getRandomQueryId() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export const createWhalesAddStakeCommand = async () => {
  const addStakeCommand = new Cell();
  addStakeCommand.bits.writeUint(2077040623, 32);
  addStakeCommand.bits.writeUint(getRandomQueryId(), 64); // Query ID
  addStakeCommand.bits.writeCoins(100000); // Gas

  return encodeBytes(await addStakeCommand.toBoc());
};

export const createWhalesWithdrawStakeCell = async (amount: BN) => {
  const addStakeCommand = new Cell();
  addStakeCommand.bits.writeUint(3665837821, 32);
  addStakeCommand.bits.writeUint(getRandomQueryId(), 64); // Query ID
  addStakeCommand.bits.writeCoins(100000); // Gas
  addStakeCommand.bits.writeCoins(amount); // Amount

  return encodeBytes(await addStakeCommand.toBoc());
};

export const createTfAddStakeCommand = async () => {
  const addStakeCommand = new Cell();
  addStakeCommand.bits.writeUint(0, 32);
  addStakeCommand.bits.writeString('d');

  return encodeBytes(await addStakeCommand.toBoc());
};

export const createTfWithdrawStakeCell = async () => {
  const addStakeCommand = new Cell();
  addStakeCommand.bits.writeUint(0, 32);
  addStakeCommand.bits.writeString('w');

  return encodeBytes(await addStakeCommand.toBoc());
};

export const getStakeSignRawMessage = async (
  pool: PoolInfo,
  amount: BN,
  transactionType: StakingTransactionType,
  isWithdrawAll?: boolean,
): Promise<SignRawMessage> => {
  const withdrawalFee = getWithdrawalFee(pool);

  const address = new Address(pool.address).format({ bounce: true });

  if (pool.implementation === 'whales') {
    const payload =
      transactionType === StakingTransactionType.DEPOSIT
        ? await createWhalesAddStakeCommand()
        : await createWhalesWithdrawStakeCell(isWithdrawAll ? Ton.toNano(0) : amount);

    return {
      address,
      amount: transactionType === StakingTransactionType.DEPOSIT ? amount : withdrawalFee,
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

  if (pool.implementation === 'tf') {
    return Ton.toNano('1');
  }

  return Ton.toNano(0);
};
