import { MessageRelaxed } from '@ton/core';

export type NftCollectionDeployParams = {
  ownerAddress?: string;
  royaltyAddress: string;
  royalty: number;
  collectionContentUri: string;
  nftItemContentBaseUri: string;
  nftCollectionCodeHex?: string;
  nftItemCodeHex: string;
  amount: string;

  contractAddress?: string;
  nftCollectionStateInitHex?: string;
};

export type NftItemDeployParams = {
  ownerAddress?: string;
  nftItemContentBaseUri: string;
  nftCollectionAddress: string;
  itemContentUri: string;
  itemIndex: number;
  amount: string;
  forwardAmount: string;
};

export type NftTransferParams = {
  newOwnerAddress: string;
  nftItemAddress: string;
  forwardAmount: string;
  amount: string;
  text?: string;
};

export type NftChangeOwnerParams = {
  nftCollectionAddress: string;
  newOwnerAddress: string;
  amount: string;
};

export type NftSalePlaceParams = {
  marketplaceAddress: string; // (string): address of the marketplace
  marketplaceFee: string; // (integer): nanocoins as marketplace fee
  royaltyAddress: string; // (string): address for the royalties
  nftItemAddress: string; // (string): identifier of the specific nft item
  royaltyAmount: string; // (integer): nanotoncoins sent as royalties
  fullPrice: string; // (integer): price in nanocoins
  amount: string; //(integer): nanotoncoins sent as commission with the message
};

export type NftSaleCancelParams = {
  nftItemAddress: string;
  saleAddress: string; // (string): address of the sale contract
  ownerAddress: string; //(string): owner of the NFT item
  amount: string;
};

export type NftSalePlaceGetgemsParams = {
  marketplaceFeeAddress: string; // (string): fee-collecting address
  marketplaceFee: string; // (decimal string): nanocoins as marketplace fee
  royaltyAddress: string; // (string): address for the royalties
  royaltyAmount: string; // (decimal string): nanotoncoins sent as royalties
  createdAt: number; // (integer): UNIX timestamp of the sale creation date
  marketplaceAddress: string; // (string): address of the marketplace
  nftItemAddress: string; // (string): identifier of the specific nft item
  ownerAddress: string; // (string): owner of the NFT item
  fullPrice: string; // (decimal string): price in nanocoins
  deployAmount: string; // (decimal string): nanotoncoins sent with deployment of sale contract
  transferAmount: string; // (decimal string): nanotoncoins sent with nft transfer message
  saleMessageBocHex: string; // (string): hex-encoded arbitrary BoC with one cell (typically an empty cell)
  marketplaceSignatureHex: string; // (string): hex-encoded signature
  forwardAmount: string; // (decimal string): nanocoins to be sent as a notification to the sale contract
};

export type DeployParams = {
  address: string; // (string)
  stateInitHex: string; // (string): hex-encoded collection contract code BoC with one cell encapsulating entire StateInit
  amount: string; // (decimal string): nanotoncoins
  text?: string; // (string, optional): text message that must be attached to the deploy operation
};

export type NftSingleDeployParams = {
  itemContentUri: string; // (string): path to the item description
  contractAddress: string;
  stateInitHex: string;
  amount: string;
};

export interface SignRawMessage {
  address: string;
  /*
      number of nanocoins to send. decimal string
  */
  amount: string;
  /*
    raw one-cell BoC encoded in Base64. String base64, optional
  */
  payload?: string;
  /*
    raw once-cell BoC encoded in Base64. string base64, optional
  */
  stateInit?: string;
}

export type SignRawParams = {
  source?: string;
  valid_until?: number;
  messages: SignRawMessage[];
};

export type TxTypes =
  | 'nft-collection-deploy'
  | 'nft-item-deploy'
  | 'nft-single-deploy'
  | 'nft-change-owner'
  | 'nft-transfer'
  | 'nft-sale-place'
  | 'nft-sale-cancel'
  | 'nft-sale-place-getgems'
  | 'sign-raw-payload'
  | 'deploy'
  | 'sign-raw-payload'
  | 'deploy';

export type TxParams =
  | NftCollectionDeployParams
  | NftItemDeployParams
  | NftSingleDeployParams
  | NftChangeOwnerParams
  | NftTransferParams
  | NftSalePlaceParams
  | NftSalePlaceGetgemsParams
  | NftSaleCancelParams
  | DeployParams
  | SignRawParams
  | DeployParams
  | SignRawParams;

export type TxResponseOptions = {
  broadcast: boolean;
  return_url?: string;
  callback_url?: string;
  onDone?: () => void;
};

export type TxRequestBody<TParams = TxParams> = {
  experimentalWithBattery?: boolean;
  forceRelayerUse?: boolean;
  type: TxTypes;
  expires_sec?: number;
  response_options?: TxResponseOptions;
  params: TParams;
  fee?: string;
};

export type TxBodyOptions = Omit<TxRequestBody, 'params' | 'type'>;

export type TxRequest =
  | {
      version: '0';
      body: TxRequestBody;
    }
  | {
      version: '1';
      author_id: string;
      body: string;
      signature: string;
    };
