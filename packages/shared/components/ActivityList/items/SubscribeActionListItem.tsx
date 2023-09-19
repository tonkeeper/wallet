import { useSubscription } from '../../../query/hooks/useSubscription';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { ActionListItem } from '../ActionListItem';
import { StyleSheet } from 'react-native';
import { t } from '../../../i18n';
import { memo } from 'react';

interface SubscribeActionListItemProps {
  action: ActionItem<ActionType.Subscribe>;
}

export const SubscribeActionListItem = memo<SubscribeActionListItemProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionListItem
      title={t('transactions.subscription')}
      subtitle={subscription?.merchantName}
      iconName="ic-bell-28"
      action={action}
    />
  );
});

const styles = StyleSheet.create({
  container: {},
});
