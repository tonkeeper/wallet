import { useMemo } from 'react';
import { NFTModel } from '$store/models';
import { Address } from '@tonkeeper/shared/Address';
import { useNftsState, useTokenApproval, useWallet } from '@tonkeeper/shared/hooks';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { TokenApprovalStatus } from '$wallet/managers/TokenApprovalManager';
import { TrustType } from '@tonkeeper/core/src/TonAPI';

export interface IBalances {
  enabled: NFTModel[];
  disabled: NFTModel[];
  spam: NFTModel[];
}
export function useApprovedNfts() {
  const accountNfts = useNftsState((s) => s.accountNfts);
  const approvalStatuses = useTokenApproval((state) => state.tokens);
  const wallet = useWallet();
  const nfts = useMemo(() => {
    const nftBalances: IBalances = {
      enabled: [],
      disabled: [],
      spam: [],
    };
    Object.values(accountNfts).forEach((item) => {
      const nft = mapNewNftToOldNftData(item, wallet?.address.ton.friendly);
      const collectionAddress = nft?.collection?.address;
      const nftAddress = Address.parse(nft.address).toRaw();
      const isBlacklisted = nft.trust === TrustType.Blacklist;

      // get approval status using collection address if it exists, otherwise use nft address
      const approvalStatus =
        (collectionAddress && approvalStatuses[collectionAddress]) ||
        approvalStatuses[nftAddress];

      if (approvalStatus?.current === TokenApprovalStatus.Declined) {
        nftBalances.disabled.push(nft);
      } else if (
        (isBlacklisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Spam
      ) {
        nftBalances.spam.push(nft);
      } else {
        nftBalances.enabled.push(nft);
      }
    });

    return nftBalances;
  }, [approvalStatuses, accountNfts, wallet]);
  return nfts;
}
