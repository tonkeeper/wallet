import { SubscribeActionData, ActivityEvent } from '@tonkeeper/core';
import { ActionListItem } from '../ActionListItem';
import { StyleSheet } from 'react-native';
import { memo } from 'react';

interface SubscribeActionListItemProps {
  action: SubscribeActionData;
  event: ActivityEvent;
}

export const SubscribeActionListItem = memo<SubscribeActionListItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} action={action} />;
});

const styles = StyleSheet.create({
  container: {},
});
