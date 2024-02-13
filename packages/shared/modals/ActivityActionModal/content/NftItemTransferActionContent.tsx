import { AddressListItem } from '../components/AddressListItem';
import { NftItemPayload } from '../components/NftItemPayload';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { copyText, List, Text } from '@tonkeeper/uikit';
import { memo } from 'react';
import { t } from '../../../i18n';
import { EncryptedComment, EncryptedCommentLayout } from '../../../components';

interface NftItemTransferActionContenttProps {
  action: ActionItem<ActionType.NftItemTransfer>;
}

export const NftItemTransferActionContent = memo<NftItemTransferActionContenttProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent
        action={action}
        header={
          action.status === ActionStatusEnum.Ok ? (
            <NftItemPayload nftAddress={action.payload.nft} />
          ) : (
            <Text type="h2">NFT</Text>
          )
        }
      >
        <List>
          <AddressListItem
            destination={action.destination}
            recipient={action.payload.recipient}
            sender={action.payload.sender}
          />
          <ExtraListItem extra={action.event.extra} />
          {action.payload?.encrypted_comment && (
            <EncryptedComment
              layout={EncryptedCommentLayout.LIST_ITEM}
              encryptedComment={action.payload.encrypted_comment}
              actionId={action.action_id}
              sender={action.payload.sender!}
            />
          )}
          {!!action.payload.comment && (
            <List.Item
              titleType="secondary"
              title={t('transactionDetails.comment')}
              onPress={copyText(action.payload.comment)}
              value={action.payload.comment}
              valueMultiline
            />
          )}
        </List>
      </ActionModalContent>
    );
  },
);
