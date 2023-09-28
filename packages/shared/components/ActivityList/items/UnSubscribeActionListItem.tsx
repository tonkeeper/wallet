import { useSubscription } from '../../../query/hooks/useSubscription';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { ActionListItem } from '../ActionListItem';
import { t } from '../../../i18n';
import { memo } from 'react';

interface UnSubscribeActionListItemProps {
  action: ActionItem<ActionType.UnSubscribe>;
}

export const UnSubscribeActionListItem = memo<UnSubscribeActionListItemProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionListItem
      title={t('transactions.unsubscription')}
      subtitle={subscription?.merchantName}
      iconName="ic-xmark-28"
      action={action}
    />
  );
});
