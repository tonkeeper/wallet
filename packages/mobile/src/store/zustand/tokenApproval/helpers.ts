import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';

export function approveAll(addresses: { address: string; isCollection?: boolean }[]) {
  addresses.map((address) => {
    useTokenApprovalStore
      .getState()
      .actions.updateTokenStatus(
        address.address,
        TokenApprovalStatus.Approved,
        address.isCollection ? TokenApprovalType.Collection : TokenApprovalType.Token,
      );
  });
}
