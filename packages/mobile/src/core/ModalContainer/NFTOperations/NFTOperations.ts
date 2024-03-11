import {
  TransferMethodParams,
  WalletContract,
} from 'tonweb/dist/types/contract/wallet/wallet-contract';
import { DeployParams, NftTransferParams, SignRawParams } from './TXRequest.types';
import TonWeb, { Method } from 'tonweb';
import BigNumber from 'bignumber.js';
import { Base64, truncateDecimal } from '$utils';
import { Wallet } from 'blockchain';
import { NFTOperationError } from './NFTOperationError';
import { Address as AddressType } from 'tonweb/dist/types/utils/address';
import { Address } from '@ton/core';
import { t } from '@tonkeeper/shared/i18n';
import { Ton } from '$libs/Ton';
import { Configuration, NFTApi } from '@tonkeeper/core/src/legacy';
import { tk } from '$wallet';
import { config } from '$config';

const { NftItem } = TonWeb.token.nft;

type EstimateFeeTransferMethod = (
  params: Omit<TransferMethodParams, 'secretKey'>,
) => Method;
export class NFTOperations {
  private tonwebWallet: WalletContract;
  private wallet: Wallet;
  private nftApi = new NFTApi(
    new Configuration({
      basePath: config.get('tonapiV2Endpoint', tk.wallet.isTestnet),
      headers: {
        Authorization: `Bearer ${config.get('tonApiV2Key', tk.wallet.isTestnet)}`,
      },
    }),
  );

  private myAddresses: { [key: string]: string } = {};

  constructor(wallet: Wallet) {
    this.tonwebWallet = wallet.vault.tonWallet;
    this.wallet = wallet;
    this.getMyAddresses();
  }

  public async transfer(
    params: Omit<NftTransferParams, 'address'>,
    options?: { useCurrentWallet?: boolean },
  ) {
    let wallet: WalletContract;
    if (options?.useCurrentWallet) {
      wallet = this.getCurrentWallet();
    } else {
      const ownerAddress = await this.getOwnerAddressByItem(params.nftItemAddress);
      wallet = await this.getWalletByAddress(ownerAddress);
    }

    const seqno = await this.getSeqno((await wallet.getAddress()).toString(false));
    const responseAddress = await wallet.getAddress();

    const forwardPayload = new TextEncoder().encode(params.text ?? '');
    const forwardAmount = this.toNano(params.forwardAmount);
    const amount = this.toNano(params.amount);

    const newOwnerAddress = new TonWeb.utils.Address(params.newOwnerAddress);
    const nftItemAddress = new TonWeb.utils.Address(params.nftItemAddress);
    const nftItem = new NftItem(wallet.provider, { address: nftItemAddress });

    const payload = await nftItem.createTransferBody({
      responseAddress,
      newOwnerAddress,
      forwardPayload,
      forwardAmount,
    });

    return this.methods(wallet, {
      toAddress: nftItemAddress,
      amount: amount,
      sendMode: 3,
      payload,
      seqno,
    });
  }

  public async deploy(params: DeployParams) {
    const wallet = this.getCurrentWallet();
    const seqno = await this.getSeqno((await wallet.getAddress()).toString(false));

    const stateInitCell = TonWeb.boc.Cell.oneFromBoc(params.stateInitHex);
    const hashBytes = await stateInitCell.hash();
    const hashHex = TonWeb.utils.bytesToHex(hashBytes);
    const address = new TonWeb.utils.Address(params.address);
    const addressHashHex = TonWeb.utils.bytesToHex(address.hashPart);

    if (hashHex !== addressHashHex) {
      throw new NFTOperationError('Hash part from StateInit does not match address');
    }

    return this.methods(wallet, {
      amount: this.toNano(params.amount),
      stateInit: stateInitCell,
      toAddress: address,
      sendMode: 3,
      seqno,
    });
  }

  private seeIfBounceable(address: string) {
    try {
      return Address.isFriendly(address)
        ? Address.parseFriendly(address).isBounceable
        : true;
    } catch {
      return true;
    }
  }

  public async signRaw(params: SignRawParams, sendMode = 3) {
    const wallet = this.getCurrentWallet();

    const signRawMethods = async (secretKey?: Uint8Array) => {
      const seqno = await this.getSeqno((await wallet.getAddress()).toString(false));
      const signingMessage = (wallet as any).createSigningMessage(seqno);

      const messages = [...params.messages].splice(0, 4);
      for (let message of messages) {
        const isBounceable = this.seeIfBounceable(message.address);
        const order = TonWeb.Contract.createCommonMsgInfo(
          TonWeb.Contract.createInternalMessageHeader(
            new TonWeb.Address(message.address).toString(true, true, isBounceable),
            new TonWeb.utils.BN(this.toNano(message.amount)),
          ),
          Ton.base64ToCell(message.stateInit),
          Ton.base64ToCell(message.payload),
        );

        signingMessage.bits.writeUint8(sendMode);
        signingMessage.refs.push(order);
      }

      return TonWeb.Contract.createMethod(
        wallet.provider,
        (wallet as any).createExternalMessage(
          signingMessage,
          secretKey,
          seqno,
          !secretKey,
        ),
      );
    };

    return {
      getBoc: async (): Promise<string> => {
        const methods = await signRawMethods();

        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        return boc;
      },
      estimateFee: async () => {
        const methods = await signRawMethods();
        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));
        const feeInfo = await tk.wallet.tonapi.wallet.emulateMessageToWallet({ boc });
        const fee = new BigNumber(feeInfo.event.extra).multipliedBy(-1).toNumber();

        return truncateDecimal(Ton.fromNano(fee.toString()), 2, true);
      },
      send: async (secretKey: Uint8Array, onDone?: (boc: string) => void) => {
        const methods = await signRawMethods(secretKey);

        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        await tk.wallet.tonapi.blockchain.sendBlockchainMessage(
          { boc },
          { format: 'text' },
        );

        onDone?.(boc);
      },
    };
  }

  private async getOwnerAddressByItem(nftItemAddress: string) {
    const nftItemData = await this.nftApi.getNftItemsByAddresses({
      getAccountsRequest: { accountIds: [nftItemAddress] },
    });
    const ownerAddress = nftItemData.nftItems[0].owner?.address;

    if (!ownerAddress) {
      throw new NFTOperationError('No ownerAddress');
    }

    const isTestnet = this.wallet.ton.isTestnet;
    return new TonWeb.Address(ownerAddress).toString(true, true, true, isTestnet);
  }

  private async getOwnerAddressByCollection(nftCollectionAddress: string) {
    const nftCollection = await this.nftApi.getNftCollection({
      accountId: nftCollectionAddress,
    });

    const isTestnet = this.wallet.ton.isTestnet;
    return new TonWeb.Address(nftCollection.owner?.address as string).toString(
      true,
      true,
      true,
      isTestnet,
    );
  }

  //
  // Utils
  //

  private async getSeqno(address: string) {
    const seqno = await this.wallet.ton.getSeqno(address);
    return seqno ?? 0;
  }

  public toNano(amount: string) {
    return Ton.toNano(Ton.fromNano(amount));
  }

  private methods<T>(
    wallet: WalletContract,
    params: Omit<TransferMethodParams, 'secretKey'>,
    data?: T,
  ) {
    return {
      getData: () => data!,
      estimateFee: async () => {
        const transfer = wallet.methods.transfer as EstimateFeeTransferMethod;
        const methods = transfer(params);
        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));
        const feeInfo = await tk.wallet.tonapi.wallet.emulateMessageToWallet({ boc });
        const fee = new BigNumber(feeInfo.event.extra).multipliedBy(-1).toNumber();

        return truncateDecimal(Ton.fromNano(fee.toString()), 2, true);
      },
      send: async (secretKey: Uint8Array) => {
        const myInfo = await this.wallet.ton.getWalletInfo(
          (wallet.address as AddressType).toString(true, true, false),
        );

        let amountBN: BigNumber;
        if (typeof params.amount === 'number') {
          amountBN = new BigNumber(params.amount);
        } else {
          amountBN = new BigNumber(params.amount.toNumber());
        }

        const transfer = wallet.methods.transfer({
          ...params,
          secretKey,
        });

        let feeNano: BigNumber;
        try {
          const query = await transfer.getQuery();
          const boc = Base64.encodeBytes(await query.toBoc(false));
          const feeInfo = await tk.wallet.tonapi.wallet.emulateMessageToWallet({ boc });
          feeNano = new BigNumber(feeInfo.event.extra).multipliedBy(-1);
        } catch (e) {
          throw new NFTOperationError(t('send_fee_estimation_error'));
        }

        if (
          amountBN
            .plus(params.sendMode === 128 ? 0 : feeNano)
            .isGreaterThan(myInfo?.balance ?? '0')
        ) {
          throw new NFTOperationError(t('send_insufficient_funds'));
        }

        const queryMsg = await transfer.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        await tk.wallet.tonapi.blockchain.sendBlockchainMessage(
          { boc },
          { format: 'text' },
        );
      },
    };
  }

  private async getMyAddresses() {
    if (Object.keys(this.myAddresses).length > 0) {
      return this.myAddresses;
    }

    const addresses = await this.wallet.ton.getAllAddresses();

    const reverse = Object.fromEntries(
      Object.entries(addresses).map(([key, value]) => {
        const address = new TonWeb.utils.Address(value as string).toString(false);
        return [address, key];
      }),
    );

    this.myAddresses = reverse;

    return reverse;
  }

  private async getWalletByAddress(unknownAddress: string): Promise<WalletContract> {
    const addresses = await this.getMyAddresses();

    const address = new TonWeb.utils.Address(unknownAddress).toString(false);
    const version = addresses[address];

    if (!version) {
      throw new NFTOperationError('Wrong owner address');
    }

    const wallet = this.wallet.vault.tonWalletByVersion(version);
    await wallet.getAddress();
    return wallet;
  }

  private getCurrentWallet(): WalletContract {
    return this.wallet.vault.tonWallet;
  }
}
