import React, { memo } from 'react';
import { ListItem, ListItemProps } from '$uikit/List/ListItem';
import Checkbox, { CheckboxProps } from '$uikit/Checkbox/Checkbox';
import { View } from 'react-native';

export type ListItemWithCheckboxProps = ListItemProps & CheckboxProps;

export const ListItemWithCheckbox = memo<ListItemWithCheckboxProps>((props) => {
  const { checked, onChange, onPress } = props;
  return (
    <ListItem
      {...props}
      onPress={onPress || onChange}
      value={
        <View style={{ marginRight: 3 }}>
          <Checkbox checked={checked} onChange={onChange} />
        </View>
      }
    />
  );
});
