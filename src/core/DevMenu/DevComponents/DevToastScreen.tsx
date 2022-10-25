import React from 'react';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Button, DevSeparator, Screen } from '$uikit';
import { Toast, ToastSize } from '$store';

export const DevToastScreen: React.FC = () => {
  return (
    <Screen>
      <Screen.Header title="Typography" rightContent={<AttachScreenButton />} />

      <Screen.ScrollView>
        <Button
          onPress={() => {
            Toast.fail('Label');
          }}
        >
          Show fail
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            Toast.fail('Label', { size: ToastSize.Small });
          }}
        >
          Show small fail
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            Toast.success('Label');
          }}
        >
          Show success
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            Toast.loading();
          }}
        >
          Show loading
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            Toast.hide();
          }}
        >
          Hide
        </Button>
      </Screen.ScrollView>
    </Screen>
  );
};
