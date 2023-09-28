import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { List } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface WithdrawStakeRequestActionContentProps {
  action: ActionItem<ActionType.WithdrawStakeRequest>;
}

export const WithdrawStakeRequestActionContent =
  memo<WithdrawStakeRequestActionContentProps>((props) => {
    const { action } = props;

    return (
      <ActionModalContent
        label={t('activityActionModal.withdrawal_request')}
        action={action}
      >
        <List>
          <AddressListItem
            destination={action.destination}
            hideName={action.event.is_scam}
            sender={action.payload.pool}
            bounceable
          />
          <ExtraListItem extra={action.event.extra} />
        </List>
      </ActionModalContent>
    );
  });
