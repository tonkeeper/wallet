import React, { memo } from 'react';
import { RootStackContext } from './context/RootStackContext';
import { ErrorBoundary } from '@tonkeeper/mobile/src/shared/components/ErrorBoundary';

export function withModalStack(stacks: {
  ModalStack: React.ComponentType<any>;
  RootStack: React.ComponentType<any>;
}) {
  const { ModalStack, RootStack } = stacks;
  return memo(() => (
    <ErrorBoundary>
      <RootStackContext.Provider value={RootStack}>
        <ModalStack />
      </RootStackContext.Provider>
    </ErrorBoundary>
  ));
}
