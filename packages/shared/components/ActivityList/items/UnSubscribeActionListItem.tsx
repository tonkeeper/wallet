import { ActionListItem, ActionListItemProps } from '../ActionListItem';
import { useSubscription } from '../../../query/hooks/useSubscription';

import { t } from '../../../i18n';
import { memo } from 'react';
import { ActionType } from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

type UnSubscribeActionListItemProps = ActionListItemProps<ActionType.UnSubscribe>;

export const UnSubscribeActionListItem = memo<UnSubscribeActionListItemProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionListItem
      title={t('transactions.unsubscription')}
      subtitle={subscription?.merchantName}
      iconName="ic-xmark-28"
      {...props}
    />
  );
});
