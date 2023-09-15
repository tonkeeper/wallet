import { AddressListItem } from '../components/AddressListItem';
import { DetailedNftItem } from '../components/DetailedNftItem';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { Text } from '@tonkeeper/uikit';
import { memo } from 'react';
import { t } from '../../../i18n';

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
          <DetailedNftItem nft={action.payload.nft} />
        ) : (
          <Text type="h2">NFT</Text>
        )
      }
    >
      <AddressListItem destination="in" sender={action.payload.seller} />
      <ExtraListItem extra={action.event.extra} />
    </ActionModalContent>
  );
});
