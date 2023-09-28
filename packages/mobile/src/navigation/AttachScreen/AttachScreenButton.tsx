import React from 'react';
import { ns } from '$utils';
import { Button } from '$uikit/Button/Button';
import { useAttachScreen } from "./AttachScreenContext";
import { getCurrentRouteName } from '$navigation/imperative';

export const AttachScreenButton = () => {
  const { attach, pathname } = useAttachScreen();
  const currentPathname = getCurrentRouteName() ?? '';

  return (
    <Button
      size="navbar_small"
      mode="secondary"
      onPress={() => {
        attach(currentPathname === pathname ? null : currentPathname);
      }}
    >
      {currentPathname === pathname ? 'Detach' : 'Attach'}
    </Button>
  );
};