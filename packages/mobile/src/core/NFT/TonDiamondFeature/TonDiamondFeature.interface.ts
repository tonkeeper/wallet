import { NFTModel, TonDiamondMetadata } from '$store/models';

export interface TonDiamondFeatureProps {
  nft: NFTModel<TonDiamondMetadata>;
  description?: string;
}
