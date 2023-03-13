import React from 'react';
import { Steezy } from '$styles';
import { Highlight, Screen, Text } from '$uikit';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { List } from '$uikit/List/new';


export const DevListComponent = () => {
  return (
    <Screen>
      <Screen.Header 
        title="UI Kit & other" 
        rightContent={
          <AttachScreenButton />
        }
      />

      <Screen.ScrollView>
        <List headerTitle="Test">
          <List.Item 
            title="Test"
            onPress={() => {}}
          />
          <List.Item 
            title="Test"
            subtitle="Test"
            value="Value"
            subvalue="Subvalue"
            onPress={() => {}}
          />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
