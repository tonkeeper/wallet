import React, { memo } from 'react';
import { ListItem, ListItemProps } from '$uikit/List/ListItem';
import Checkbox, { CheckboxProps } from '$uikit/Checkbox/Checkbox';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTheme } from '$hooks/useTheme';

export type ListItemWithCheckboxProps = ListItemProps & CheckboxProps;

export const ListItemWithCheckbox = memo<ListItemWithCheckboxProps>((props) => {
  const { checked, onChange, onPress } = props;
  const isPressedListItem = useSharedValue(false);
  const { colors } = useTheme();

  return (
    <ListItem
      underlayColor={colors.backgroundSecondary}
      isPressedSharedValue={isPressedListItem}
      {...props}
      onPress={onPress || onChange}
      value={
        <Checkbox
          isPressedListItem={isPressedListItem}
          checked={checked}
          onChange={onChange}
        />
      }
    />
  );
});
