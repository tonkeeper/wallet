import React from 'react';
import { Screen, List } from '$uikit';
import { AttachScreenButton } from '$navigation/AttachScreen';

export const DevListComponent = () => {
  const [checked, setChecked] = React.useState(false);

  const handleCheckboxChange = React.useCallback(() => {
    setChecked(!checked);
  }, [checked]);

  return (
    <Screen>
      <Screen.Header title="UI Kit & other" rightContent={<AttachScreenButton />} />

      <Screen.ScrollView>
        <List indent={false} headerTitle="Test">
          <List.Item title="Test" onPress={() => {}} />
          <List.Item
            title="Test"
            subtitle="Test"
            value="Value"
            subvalue="Subvalue"
            onPress={() => {}}
          />
        </List>
        <List headerTitle="ListItem with Checkbox" indent={false}>
          <List.ItemWithCheckbox
            title="Allow notifications"
            checked={checked}
            onChange={handleCheckboxChange}
          />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
