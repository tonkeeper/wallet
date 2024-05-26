import React, { memo } from 'react';
import { NftPreviewContent } from './NftPreviewContent';
import { ListItemContentText } from '@tonkeeper/uikit';
import { ListItemEncryptedComment } from '@tonkeeper/uikit/src/components/List/ListItemEncryptedComment';
import { ActionListItem, ActionListItemProps } from './ActionListItem';
import { ActionType } from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { useNftItemByAddress } from '../../query/hooks/useNftItemByAddress';
import { TrustType } from '@tonkeeper/core/src/TonAPI';
import { Address } from '../../Address';
import { TokenApprovalStatus } from '@tonkeeper/mobile/src/wallet/managers/TokenApprovalManager';
import { useTokenApproval } from '../../hooks';

export interface ActionListItemWithNftProps
  extends ActionListItemProps<ActionType.NftPurchase | ActionType.NftItemTransfer> {}

export const ActionListItemWithNft = memo<ActionListItemWithNftProps>((props) => {
  const { action } = props;
  const { payload, type } = action;

  const nftAddress = type === ActionType.NftPurchase ? payload.nft.address : payload.nft;
  const nftItem = type === ActionType.NftPurchase ? payload.nft : undefined;

  const { data: nft } = useNftItemByAddress(nftAddress, {
    existingNft: nftItem,
  });

  const approvalStatuses = useTokenApproval((state) => state.tokens);
  const approvalIdentifier = nft?.address
    ? Address.parse(nft?.collection?.address ?? nft?.address).toRaw()
    : '';
  const nftApprovalStatus = approvalStatuses[approvalIdentifier];

  const isScam =
    nft &&
    ((nft.trust === TrustType.Blacklist &&
      nftApprovalStatus?.current !== TokenApprovalStatus.Approved) ||
      nftApprovalStatus?.current === TokenApprovalStatus.Spam);

  switch (type) {
    case ActionType.NftItemTransfer:
      return (
        <ActionListItem {...props} isScam={isScam}>
          {nft && nft?.address && !isScam && (
            <NftPreviewContent
              nft={nft}
              disabled={props.disableNftPreview || props.disablePressable}
            />
          )}
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
          {!!payload.encrypted_comment && (
            <ListItemEncryptedComment
              encryptedComment={payload.encrypted_comment}
              actionId={action.action_id}
              sender={action.payload.sender!}
            />
          )}
        </ActionListItem>
      );
    case ActionType.NftPurchase:
      return (
        <ActionListItem {...props} isScam={isScam}>
          {nft && nft?.address && !isScam && (
            <NftPreviewContent
              nft={nft}
              disabled={props.disableNftPreview || props.disablePressable}
            />
          )}
        </ActionListItem>
      );
  }
});
