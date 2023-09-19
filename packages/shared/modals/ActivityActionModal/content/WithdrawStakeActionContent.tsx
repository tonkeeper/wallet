import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { List } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface WithdrawStakeActionContentProps {
  action: ActionItem<ActionType.WithdrawStake>;
}

export const WithdrawStakeActionContent = memo<WithdrawStakeActionContentProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent label={t('activityActionModal.withdraw')} action={action}>
        <List>
          <AddressListItem
            hideName={action.event.is_scam}
            sender={action.payload.pool}
            destination="in"
          />
          <ExtraListItem extra={action.event.extra} />
        </List>
      </ActionModalContent>
    );
  },
);
