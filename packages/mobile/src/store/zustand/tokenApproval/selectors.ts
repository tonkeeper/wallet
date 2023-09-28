import { ITokenApprovalStore } from '$store/zustand/tokenApproval/types';
import { Address } from '@tonkeeper/core';

export const getTokenStatus = (state: ITokenApprovalStore, address: string) => {
  const rawAddress = Address.parse(address).toRaw();
  return state.tokens[rawAddress];
};
