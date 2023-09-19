import { ActionListItem, ActionListItemProps } from '../ActionListItem';
import { useSubscription } from '../../../query/hooks/useSubscription';
import { ActionType } from '@tonkeeper/core';
import { StyleSheet } from 'react-native';
import { t } from '../../../i18n';
import { memo } from 'react';

type SubscribeActionListItemProps = ActionListItemProps<ActionType.Subscribe>;

export const SubscribeActionListItem = memo<SubscribeActionListItemProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionListItem
      title={t('transactions.subscription')}
      subtitle={subscription?.merchantName}
      iconName="ic-bell-28"
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  container: {},
});
