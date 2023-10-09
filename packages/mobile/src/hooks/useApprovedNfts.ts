import { useMemo } from 'react';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { NFTModel } from '$store/models';
import { useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { Address } from '@tonkeeper/shared/Address';

export interface IBalances {
  enabled: NFTModel[];
  disabled: NFTModel[];
}
export function useApprovedNfts() {
  const { myNfts } = useSelector(nftsSelector);
  const approvalStatuses = useTokenApprovalStore((state) => state.tokens);
  const nfts = useMemo(() => {
    const nftBalances: IBalances = {
      enabled: [],
      disabled: [],
    };
    Object.values(myNfts).forEach((item) => {
      const collectionAddress = item?.collection?.address;
      const nftAddress = Address.parse(item.address).toRaw();

      // get approval status using collection address if it exists, otherwise use nft address
      const approvalStatus =
        (collectionAddress && approvalStatuses[collectionAddress]) ||
        approvalStatuses[nftAddress];
      if (approvalStatus?.current === TokenApprovalStatus.Declined) {
        nftBalances.disabled.push(item);
      } else {
        nftBalances.enabled.push(item);
      }
    });

    return nftBalances;
  }, [approvalStatuses, myNfts]);
  return nfts;
}
