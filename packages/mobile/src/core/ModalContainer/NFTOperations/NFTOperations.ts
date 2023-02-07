import {
  TransferMethodParams,
  WalletContract,
} from 'tonweb/dist/types/contract/wallet/wallet-contract';
import {
  DeployParams,
  NftChangeOwnerParams,
  NftCollectionDeployParams,
  NftItemDeployParams,
  NftSaleCancelParams,
  NftSalePlaceGetgemsParams,
  NftSalePlaceParams,
  NftTransferParams,
  SignRawParams,
} from './TXRequest.types';
import TonWeb, { Method } from 'tonweb';
import BigNumber from 'bignumber.js';
import { Base64, truncateDecimal } from '$utils';
import { Wallet } from 'blockchain';
import { NFTOperationError } from './NFTOperationError';
import { GetGemsSaleContract } from './GetGemsSaleContract';
import { Cell } from 'tonweb/dist/types/boc/cell';
import { Address } from 'tonweb/dist/types/utils/address';
import { t } from '$translation';
import { Ton } from '$libs/Ton';
import { getServerConfig } from '$shared/constants';
import { AccountEvent, Configuration, SendApi, NFTApi } from 'tonapi-sdk-js';
import axios from 'axios';

const { NftCollection, NftItem, NftSale } = TonWeb.token.nft;

type EstimateFeeTransferMethod = (
  params: Omit<TransferMethodParams, 'secretKey'>,
) => Method;
export class NFTOperations {
  private tonwebWallet: WalletContract;
  private wallet: Wallet;
  private nftApi = new NFTApi(
    new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    }),
  );

  private sendApi = new SendApi(
    new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    }),
  );

  private myAddresses: { [key: string]: string } = {};

  constructor(wallet: Wallet) {
    this.tonwebWallet = wallet.vault.tonWallet;
    this.wallet = wallet;

    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    });

    this.sendApi = new SendApi(tonApiConfiguration);

    this.getMyAddresses();
  }

  public async deployCollection(params: NftCollectionDeployParams) {
    const wallet = params.ownerAddress
      ? await this.getWalletByAddress(params.ownerAddress)
      : this.getCurrentWallet();

    const ownerAddress = params.ownerAddress
      ? new TonWeb.utils.Address(params.ownerAddress)
      : await wallet.getAddress();

    const amount = Ton.fromNano(params.amount);
    const seqno = await this.getSeqno(ownerAddress.toString(false));

    let stateInit: Cell;
    let nftCollectionAddress: string;
    if (params.nftCollectionStateInitHex && params.contractAddress) {
      stateInit = TonWeb.boc.Cell.oneFromBoc(params.nftCollectionStateInitHex);
      nftCollectionAddress = params.contractAddress;
    } else {
      const royaltyAddress = new TonWeb.utils.Address(params.royaltyAddress);

      const collectionCodeCell = params.nftCollectionCodeHex
        ? TonWeb.boc.Cell.oneFromBoc(params.nftCollectionCodeHex)
        : undefined;

      const nftCollection = new NftCollection(wallet.provider, {
        nftItemContentBaseUri: params.nftItemContentBaseUri,
        collectionContentUri: params.collectionContentUri,
        nftItemCodeHex: params.nftItemCodeHex,
        royalty: params.royalty,
        royaltyAddress,
        ownerAddress,
        code: collectionCodeCell,
      });

      const nftCollectionAddressInfo = await nftCollection.getAddress();
      nftCollectionAddress = nftCollectionAddressInfo.toString(true, true, true);

      const createdStateInit = await nftCollection.createStateInit();
      stateInit = createdStateInit.stateInit;
    }

    return this.methods(wallet, {
      amount: Ton.toNano(amount),
      toAddress: nftCollectionAddress,
      sendMode: 3,
      stateInit,
      seqno,
    });
  }

  public async deployItem(params: NftItemDeployParams) {
    const wallet = params.ownerAddress
      ? await this.getWalletByAddress(params.ownerAddress)
      : this.getCurrentWallet();

    const ownerAddress = params.ownerAddress
      ? new TonWeb.utils.Address(params.ownerAddress)
      : await wallet.getAddress();

    const seqno = await this.getSeqno(ownerAddress.toString(false));

    const amount = this.toNano(params.amount);
    const forwardAmount = this.toNano(params.forwardAmount);

    const nftCollectionAddressInfo = new TonWeb.utils.Address(
      params.nftCollectionAddress,
    );
    const nftCollectionAddress = nftCollectionAddressInfo.toString(true, true, true);

    const nftCollection = new NftCollection(wallet.provider, {
      address: params.nftCollectionAddress,
    });

    const payload = nftCollection.createMintBody({
      itemContentUri: params.itemContentUri,
      itemOwnerAddress: ownerAddress,
      itemIndex: params.itemIndex,
      amount: forwardAmount,
    });

    return this.methods(wallet, {
      toAddress: nftCollectionAddress,
      sendMode: 3,
      payload,
      amount,
      seqno,
    });
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

  public async changeOwner(params: NftChangeOwnerParams) {
    const ownerAddress = await this.getOwnerAddressByCollection(
      params.nftCollectionAddress,
    );
    const wallet = await this.getWalletByAddress(ownerAddress);
    const seqno = await this.getSeqno(ownerAddress);

    const amount = this.toNano(params.amount);

    const nftCollection = new NftCollection(wallet.provider, {});
    const nftCollectionAddressInfo = new TonWeb.utils.Address(
      params.nftCollectionAddress,
    );
    const nftCollectionAddress = nftCollectionAddressInfo.toString(true, true, true);

    const payload = nftCollection.createChangeOwnerBody({
      newOwnerAddress: new TonWeb.utils.Address(params.newOwnerAddress),
    });

    return this.methods(wallet, {
      toAddress: nftCollectionAddress,
      amount: amount,
      sendMode: 3,
      payload,
      seqno,
    });
  }

  public async saleCancel(params: NftSaleCancelParams) {
    const wallet = await this.getWalletByAddress(params.ownerAddress);

    const saleAddress = new TonWeb.utils.Address(params.saleAddress);
    const sale = new NftSale(wallet.provider, {});
    const payload = await sale.createCancelBody({});
    const amount = this.toNano(params.amount);
    const seqno = await this.getSeqno(params.ownerAddress);

    return this.methods(wallet, {
      toAddress: saleAddress,
      amount: amount,
      sendMode: 3,
      payload,
      seqno,
    });
  }

  public async salePlace(params: NftSalePlaceParams) {
    const ownerAddress = await this.getOwnerAddressByItem(params.nftItemAddress);
    const wallet = await this.getWalletByAddress(ownerAddress);

    const marketplaceAddress = new TonWeb.utils.Address(params.marketplaceAddress);
    const royaltyAddress = new TonWeb.utils.Address(params.royaltyAddress);
    const nftItemAddress = new TonWeb.utils.Address(params.nftItemAddress);

    const sale = new NftSale(wallet.provider, {
      marketplaceFee: this.toNano(params.marketplaceFee),
      royaltyAmount: this.toNano(params.royaltyAmount),
      fullPrice: this.toNano(params.fullPrice),
      nftAddress: nftItemAddress,
      marketplaceAddress,
      royaltyAddress,
    });

    const createdStateInit = await sale.createStateInit();
    const amount = this.toNano(params.amount);
    const seqno = await this.getSeqno(ownerAddress);

    const body = new TonWeb.boc.Cell();
    body.bits.writeUint(1, 32); // OP deploy new auction
    body.bits.writeCoins(amount);
    body.refs.push(createdStateInit.stateInit);
    body.refs.push(new TonWeb.boc.Cell());

    return this.methods(wallet, {
      toAddress: marketplaceAddress,
      amount: amount,
      payload: body,
      sendMode: 3,
      seqno,
    });
  }

  public async salePlaceGetGems(params: NftSalePlaceGetgemsParams) {
    const wallet = this.getCurrentWallet();
    const amount = this.toNano(params.deployAmount);
    const seqno = await this.getSeqno((await wallet.getAddress()).toString(false));

    if (Number(params.forwardAmount) < 1) {
      throw new NFTOperationError('forwardAmount must be greater than 0');
    }

    const getgems = new GetGemsSaleContract(this.tonwebWallet.provider, {
      marketplaceFeeAddress: new TonWeb.utils.Address(params.marketplaceFeeAddress),
      marketplaceAddress: new TonWeb.utils.Address(params.marketplaceAddress),
      royaltyAddress: new TonWeb.utils.Address(params.royaltyAddress),
      nftItemAddress: new TonWeb.utils.Address(params.nftItemAddress),
      marketplaceFee: this.toNano(params.marketplaceFee),
      royaltyAmount: this.toNano(params.royaltyAmount),
      fullPrice: this.toNano(params.fullPrice),
      createdAt: params.createdAt,
    });

    const { stateInit, address } = await getgems.createStateInit();
    const contractAddress = address.toString(true, true, true);

    const saleMessageBody = new TonWeb.boc.Cell();

    let signature = TonWeb.utils.hexToBytes(params.marketplaceSignatureHex);

    let payload = new TonWeb.boc.Cell();
    payload.bits.writeUint(1, 32);
    payload.bits.writeBytes(signature);
    payload.refs.push(stateInit);
    payload.refs.push(saleMessageBody);

    return this.methods(
      wallet,
      {
        toAddress: params.marketplaceAddress,
        sendMode: 3,
        amount,
        payload,
        seqno,
      },
      { contractAddress },
    );
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

  //
  // Info methods
  //

  public async getCollectionUri(nftCollectionAddress: string) {
    const nftCollection = new NftCollection(this.tonwebWallet.provider, {
      address: nftCollectionAddress,
    });

    const data = await nftCollection.getCollectionData();

    return data.collectionContentUri;
  }

  public async signRaw(params: SignRawParams) {
    const wallet = this.getCurrentWallet();

    const signRawMethods = async (secretKey?: Uint8Array) => {
      const seqno = await this.getSeqno((await wallet.getAddress()).toString(false));

      const sendMode = 3;
      const signingMessage = (wallet as any).createSigningMessage(seqno);

      const messages = [...params.messages].splice(0, 4);
      for (let message of messages) {
        const order = TonWeb.Contract.createCommonMsgInfo(
          TonWeb.Contract.createInternalMessageHeader(
            new TonWeb.Address(message.address),
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
      estimateTx: async (): Promise<AccountEvent | null> => {
        const methods = await signRawMethods();

        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        const endpoint = getServerConfig('tonapiIOEndpoint');

        const resp = await axios.post(
          `${endpoint}/v1/send/estimateTx`,
          {
            boc: boc,
          },
          {
            headers: {
              Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
            },
          },
        );

        return resp.data;
      },
      estimateFee: async () => {
        const methods = await signRawMethods();
        const feeInfo = await methods.estimateFee();
        const fee = new BigNumber(feeInfo.source_fees.in_fwd_fee)
          .plus(feeInfo.source_fees.storage_fee)
          .plus(feeInfo.source_fees.gas_fee)
          .plus(feeInfo.source_fees.fwd_fee)
          .toNumber();
        return truncateDecimal(Ton.fromNano(fee.toString()), 1, true);
      },
      send: async (secretKey: Uint8Array, onDone?: (boc: string) => void) => {
        const methods = await signRawMethods(secretKey);

        const queryMsg = await methods.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        const response = await this.sendApi.sendBoc({ sendBocRequest: { boc } });

        onDone?.(boc);

        return response;
      },
    };
  }

  public async getCollectionAddressByItem(nftItemAddress: string) {
    const nftItemData = await this.nftApi.getNftItemByAddress({
      account: nftItemAddress,
    });

    if (!nftItemData.collectionAddress) {
      throw new NFTOperationError('collectionAddress empty');
    }
    const isTestnet = this.wallet.ton.isTestnet;
    return new TonWeb.Address(nftItemData.collectionAddress).toString(
      true,
      true,
      true,
      isTestnet,
    );
  }

  private async getOwnerAddressByItem(nftItemAddress: string) {
    const nftItemData = await this.nftApi.getNftItemByAddress({
      account: nftItemAddress,
    });

    if (!nftItemData.owner?.address) {
      throw new NFTOperationError('No ownerAddress');
    }

    const isTestnet = this.wallet.ton.isTestnet;
    return new TonWeb.Address(nftItemData.owner.address).toString(
      true,
      true,
      true,
      isTestnet,
    );
  }

  private async getOwnerAddressByCollection(nftCollectionAddress: string) {
    const nftCollection = await this.nftApi.getNftCollection({
      account: nftCollectionAddress,
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
        const feeInfo = await methods.estimateFee();
        const fee = new BigNumber(feeInfo.source_fees.in_fwd_fee)
          .plus(feeInfo.source_fees.storage_fee)
          .plus(feeInfo.source_fees.gas_fee)
          .plus(feeInfo.source_fees.fwd_fee)
          .toNumber();
        return truncateDecimal(Ton.fromNano(fee.toString()), 1, true);
      },
      send: async (secretKey: Uint8Array) => {
        const myInfo = await this.wallet.ton.getWalletInfo(
          (wallet.address as Address).toString(true, true, false),
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
          const feeInfo = await transfer.estimateFee();
          feeNano = new BigNumber(feeInfo.source_fees.in_fwd_fee)
            .plus(feeInfo.source_fees.storage_fee)
            .plus(feeInfo.source_fees.gas_fee)
            .plus(feeInfo.source_fees.fwd_fee);
        } catch (e) {
          throw new NFTOperationError(t('send_fee_estimation_error'));
        }

        if (
          amountBN
            .plus(params.sendMode === 128 ? 0 : feeNano)
            .isGreaterThan(myInfo.balance)
        ) {
          throw new NFTOperationError(t('send_insufficient_funds'));
        }

        const queryMsg = await transfer.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

        await this.sendApi.sendBoc({ sendBocRequest: { boc } });
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
