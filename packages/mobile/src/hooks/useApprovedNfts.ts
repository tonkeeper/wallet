import { useMemo } from 'react';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { NFTModel } from '$store/models';
import { useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { Address } from '$libs/Ton';

export interface IBalances {
  pending: NFTModel[];
  enabled: NFTModel[];
  disabled: NFTModel[];
}
export function useApprovedNfts() {
  const { myNfts } = useSelector(nftsSelector);
  const approvalStatuses = useTokenApprovalStore((state) => state.tokens);
  const nfts = useMemo(() => {
    const nftBalances: IBalances = {
      pending: [],
      enabled: [],
      disabled: [],
    };
    Object.values(myNfts).forEach((item) => {
      const rawAddress =
        item?.collection?.address || new Address(item.address).toString(false);
      const approvalStatus = approvalStatuses[rawAddress];
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
  }, [approvalStatuses, myNfts]);
  return nfts;
}
