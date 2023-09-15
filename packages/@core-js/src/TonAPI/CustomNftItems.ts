import { AccountAddress, NftItemApprovedByEnum, Sale } from "./TonAPIGenerated";

export type NftImage = {
  preview: string | null;
  small: string | null;
  medium: string | null;
  large: string | null;
};

export interface CustomNftItem {
  address: string;
  index: number;
  owner?: AccountAddress;
  collection?: {
    address: string;
    name: string;
    description: string;
  };
  verified: boolean;
  metadata: Record<string, any>;
  sale?: Sale;
  dns?: string;
  approved_by: NftItemApprovedByEnum[];
  // Custom property
  name: string;
  image: NftImage;
  marketplaceURL?: string;
  isUsername: boolean;
  isDomain: boolean;
}