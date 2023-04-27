import { ITokenApprovalStore } from '$store/zustand/tokenApproval/types';

export const getTokenStatus = (state: ITokenApprovalStore, address: string) => {
  return state.tokens[address];
};
