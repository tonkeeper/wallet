import { AccountAddress, NftItemApprovedByEnum, Sale } from '../../TonAPI';

export type NftImage = {
  preview: string | null;
  small: string | null;
  medium: string | null;
  large: string | null;
};

export type NftAddress = string;

export type NftCollection = {
  address: string;
  name: string;
  description: string;
};

export interface NftItem {
  address: string;
  index: number;
  owner?: AccountAddress;
  collection?: NftCollection;
  verified: boolean;
  metadata: Record<string, any>;
  sale?: Sale;
  dns?: string;
  approved_by: NftItemApprovedByEnum[];
  name: string;
  image: NftImage;
  marketplaceURL?: string;
  isUsername: boolean;
  isDomain: boolean;
}
