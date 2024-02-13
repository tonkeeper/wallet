import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { List } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { StakingIcon } from '../components/StakingIcon';

interface DepositStakeActionContentProps {
  action: ActionItem<ActionType.DepositStake>;
}

export const DepositStakeActionContent = memo<DepositStakeActionContentProps>((props) => {
  const { action } = props;

  return (
    <ActionModalContent
      label={t('activityActionModal.deposit')}
      header={<StakingIcon implementation={action.payload.implementation} />}
      action={action}
    >
      <List>
        <AddressListItem
          recipient={action.payload.pool}
          hideName={action.event.is_scam}
          destination="out"
          bounceable
        />
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});
