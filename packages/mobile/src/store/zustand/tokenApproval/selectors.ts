import { ITokenApprovalStore } from '$store/zustand/tokenApproval/types';
import { Address } from '$libs/Ton';

export const getTokenStatus = (state: ITokenApprovalStore, address: string) => {
  const rawAddress = new Address(address).format({ raw: true });
  return state.tokens[rawAddress];
};
