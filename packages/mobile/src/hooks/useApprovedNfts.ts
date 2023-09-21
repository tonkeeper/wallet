import { useMemo } from 'react';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { NftItem } from '@tonkeeper/core';
import { useNftItems } from '@tonkeeper/shared/query/hooks/useNftList';

export interface IBalances {
  pending: NftItem[];
  enabled: NftItem[];
  disabled: NftItem[];
}
export function useApprovedNfts() {
  const nftItems = useNftItems();
  const approvalStatuses = useTokenApprovalStore((state) => state.tokens);
  const nfts = useMemo(() => {
    const nftBalances: IBalances = {
      pending: [],
      enabled: [],
      disabled: [],
    };
    nftItems.forEach((nftItem) => {
      const collectionAddress = nftItem.collection?.address;

      // get approval status using collection address if it exists, otherwise use nft address
      const approvalStatus =
        (collectionAddress && approvalStatuses[collectionAddress]) ||
        approvalStatuses[nftItem.address];
      if (
        (nftItem.approved_by.length > 0 && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Approved
      ) {
        nftBalances.enabled.push(nftItem);
      } else if (approvalStatus?.current === TokenApprovalStatus.Declined) {
        nftBalances.disabled.push(nftItem);
      } else {
        nftBalances.pending.push(nftItem);
      }
    });

    return nftBalances;
  }, [approvalStatuses, nftItems]);
  return nfts;
}
