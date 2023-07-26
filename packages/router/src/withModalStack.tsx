import React, { memo } from 'react';
import { RootStackContext } from './context/RootStackContext';

export function withModalStack(stacks: {
  ModalStack: React.ComponentType<any>;
  RootStack: React.ComponentType<any>;
}) {
  const { ModalStack, RootStack } = stacks;
  return memo(() => (
    <RootStackContext.Provider value={RootStack}>
      <ModalStack />
    </RootStackContext.Provider>
  ));
}
