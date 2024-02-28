import { ModalStackRouteNames } from '$navigation/navigationNames';
import { Jetton, NftItem } from 'tonapi-sdk-js';

export type ModalStackParamList = {
  [ModalStackRouteNames.TokenDetails]: {
    // TODO: fix for SheetsProvider bottomsheets
    params: {
      nft?: NftItem | string;
      jetton?: Jetton;
    };
  };
};
