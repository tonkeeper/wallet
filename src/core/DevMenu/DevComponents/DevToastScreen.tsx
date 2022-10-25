import React from 'react';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Button, DevSeparator, Screen } from '$uikit';
import { ToastSize, useToastActions } from '$store';

export const DevToastScreen: React.FC = () => {
  const toastActions = useToastActions();

  return (
    <Screen>
      <Screen.Header title="Typography" rightContent={<AttachScreenButton />} />

      <Screen.ScrollView>
        <Button
          onPress={() => {
            toastActions.fail('Label');
          }}
        >
          Show fail
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            toastActions.fail('Label', { size: ToastSize.Small });
          }}
        >
          Show small fail
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            toastActions.success('Label');
          }}
        >
          Show success
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            toastActions.loading();
          }}
        >
          Show loading
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            toastActions.hide();
          }}
        >
          Hide
        </Button>
      </Screen.ScrollView>
    </Screen>
  );
};
