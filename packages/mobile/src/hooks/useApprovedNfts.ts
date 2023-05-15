import { useMemo } from 'react';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { NFTModel } from '$store/models';
import { useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { DevFeature, useDevFeatureEnabled } from '$store';
import { Address } from '$libs/Ton';

export interface IBalances {
  pending: NFTModel[];
  enabled: NFTModel[];
  disabled: NFTModel[];
}
export function useApprovedNfts() {
  const tokenApproval = useDevFeatureEnabled(DevFeature.TokenApproval);
  const { myNfts } = useSelector(nftsSelector);
  const approvalStatuses = useTokenApprovalStore((state) => state.tokens);
  const nfts = useMemo(() => {
    const nftBalances: IBalances = {
      pending: [],
      enabled: [],
      disabled: [],
    };
    if (!tokenApproval) {
      nftBalances.enabled = Object.values(myNfts);
      return nftBalances;
    }
    Object.values(myNfts).forEach((item) => {
      const approvalStatus =
        approvalStatuses[
          item?.collectionAddress || new Address(item.address).toString(false)
        ];
      if (
        (item.isApproved && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Approved
      ) {
        nftBalances.enabled.push(item);
      } else if (approvalStatus?.current === TokenApprovalStatus.Declined) {
        nftBalances.disabled.push(item);
      } else {
        nftBalances.pending.push(item);
      }
    });

    return nftBalances;
  }, [approvalStatuses, myNfts, tokenApproval]);
  return nfts;
}
