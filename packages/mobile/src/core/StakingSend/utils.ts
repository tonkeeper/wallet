import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { Ton } from '$libs/Ton';
import { encodeBytes } from '$utils/base64';
import BN from 'bn.js';
import TonWeb from 'tonweb';
import { StakingTransactionType } from './types';
import { JettonBalanceModel } from '$store/models';
import BigNumber from 'bignumber.js';
import { Address } from '@tonkeeper/shared/Address';
import { PoolInfo, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { ContractService } from '@tonkeeper/core';

const { Cell } = TonWeb.boc;

export const createWhalesAddStakeCommand = async () => {
  const command = new Cell();
  command.bits.writeUint(2077040623, 32);
  command.bits.writeUint(ContractService.getWalletQueryId(), 64); // Query ID
  command.bits.writeCoins(100000); // Gas

  return encodeBytes(await command.toBoc());
};

export const createWhalesWithdrawStakeCell = async (amount: BN) => {
  const command = new Cell();
  command.bits.writeUint(3665837821, 32);
  command.bits.writeUint(ContractService.getWalletQueryId(), 64); // Query ID
  command.bits.writeCoins(100000); // Gas
  command.bits.writeCoins(amount); // Amount

  return encodeBytes(await command.toBoc());
};

export const createLiquidTfAddStakeCommand = async () => {
  const command = new Cell();
  command.bits.writeUint(0x47d54391, 32);
  command.bits.writeUint(ContractService.getWalletQueryId(), 64); // Query ID
  command.bits.writeUint(0x000000000005b7ce, 64); // App ID

  return encodeBytes(await command.toBoc());
};

export const createLiquidTfWithdrawStakeCell = async (amount: BN, address: string) => {
  const customPayload = new Cell();
  customPayload.bits.writeUint(1, 1);
  customPayload.bits.writeUint(0, 1);

  const payload = new Cell();
  payload.bits.writeUint(0x595f07bc, 32);
  payload.bits.writeUint(ContractService.getWalletQueryId(), 64); // Query ID
  payload.bits.writeCoins(amount); // Amount
  payload.bits.writeAddress(Address.parse(address).toTonWeb());
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

  const address = Address.parse(
    stakingJetton && transactionType !== StakingTransactionType.DEPOSIT
      ? stakingJetton.walletAddress
      : pool.address,
  ).toFriendly({ bounceable: true });

  if (pool.implementation === PoolImplementationType.Whales) {
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

  if (pool.implementation === PoolImplementationType.LiquidTF) {
    const payload =
      transactionType === StakingTransactionType.DEPOSIT
        ? await createLiquidTfAddStakeCommand()
        : await createLiquidTfWithdrawStakeCell(amount, responseAddress);

    const amountWithFee = Ton.toNano(
      new BigNumber(Ton.fromNano(amount)).plus(Ton.fromNano(withdrawalFee)).toString(),
    );

    const depositAmount =
      pool.implementation === PoolImplementationType.LiquidTF && !isSendAll
        ? amountWithFee
        : amount;

    return {
      address,
      amount:
        transactionType === StakingTransactionType.DEPOSIT
          ? depositAmount
          : withdrawalFee,
      payload,
    };
  }

  if (pool.implementation === PoolImplementationType.Tf) {
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
  if (pool.implementation === PoolImplementationType.Whales) {
    return Ton.toNano('0.2');
  }

  if (
    [PoolImplementationType.Tf, PoolImplementationType.LiquidTF].includes(
      pool.implementation,
    )
  ) {
    return Ton.toNano('1');
  }

  return Ton.toNano(0);
};

export const getWithdrawalAlertFee = (pool: PoolInfo, forDisplay = false): BN => {
  if (pool.implementation === PoolImplementationType.Whales) {
    return Ton.toNano('0.4');
  }

  if (pool.implementation === PoolImplementationType.Tf) {
    return Ton.toNano('1');
  }

  if (pool.implementation === PoolImplementationType.LiquidTF) {
    return Ton.toNano(forDisplay ? '2' : '1');
  }

  return Ton.toNano(0);
};
