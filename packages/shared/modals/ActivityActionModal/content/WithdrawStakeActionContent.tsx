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

interface WithdrawStakeActionContentProps {
  action: ActionItem<ActionType.WithdrawStake>;
}

export const WithdrawStakeActionContent = memo<WithdrawStakeActionContentProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent
        label={t('activityActionModal.withdraw')}
        header={<StakingIcon implementation={action.payload.implementation} />}
        action={action}
      >
        <List>
          <AddressListItem
            hideName={action.event.is_scam}
            sender={action.payload.pool}
            destination="in"
            bounceable
          />
          <ExtraListItem extra={action.event.extra} />
        </List>
      </ActionModalContent>
    );
  },
);
