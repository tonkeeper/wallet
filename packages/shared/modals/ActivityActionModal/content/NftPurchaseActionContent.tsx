import { AddressListItem } from '../components/AddressListItem';
import { NftItemPayload } from '../components/NftItemPayload';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { List, Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface NftPurchaseActionContentProps {
  action: ActionItem<ActionType.NftPurchase>;
}

export const NftPurchaseActionContent = memo<NftPurchaseActionContentProps>((props) => {
  const { action } = props;

  return (
    <ActionModalContent
      label={t('activityActionModal.purchase')}
      action={action}
      header={
        action.status === ActionStatusEnum.Ok ? (
          <NftItemPayload nft={action.payload.nft} />
        ) : (
          <Text type="h2">NFT</Text>
        )
      }
    >
      <List>
        <AddressListItem destination="in" sender={action.payload.seller} />
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});
