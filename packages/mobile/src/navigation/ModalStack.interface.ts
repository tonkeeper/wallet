import { ModalStackRouteNames } from '$navigation/navigationNames';
import { Jetton, NftItem } from 'tonapi-sdk-js';

export type ModalStackParamList = {
  [ModalStackRouteNames.TokenDetails]: {
    nft?: NftItem;
    jetton?: Jetton;
  };
};
