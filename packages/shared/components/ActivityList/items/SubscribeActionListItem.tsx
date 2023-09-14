import { ActionItem, ActionType } from '@tonkeeper/core';
import { ActionListItem } from '../ActionListItem';
import { StyleSheet } from 'react-native';
import { memo } from 'react';

interface SubscribeActionListItemProps {
  action: ActionItem<ActionType.Subscribe>;
}

export const SubscribeActionListItem = memo<SubscribeActionListItemProps>((props) => {
  const { action } = props;

  return <ActionListItem action={action} />;
});

const styles = StyleSheet.create({
  container: {},
});
