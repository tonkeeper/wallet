import React, { memo } from 'react';
import { DeepLinkingProvider } from '$libs/deeplinking';
import { AttachScreenProvider } from './AttachScreen';
import { useDeeplinkingResolvers } from './hooks/useDeeplinkingResolvers';
import { useDeeplinkingIsReady } from './hooks/useDeeplinkingIsReady';
import { ErrorBoundary } from '$shared/components/ErrorBoundary';
import { SkeletonProvider } from '$uikit/Skeleton';

export const ProvidersWithoutNavigation = memo(({ children }) => (
  <SkeletonProvider>
    <AttachScreenProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AttachScreenProvider>
  </SkeletonProvider>
));

export const ProvidersWithNavigation = memo(({ children }) => (
  <DeepLinkingProvider
    useIsReadyToListen={useDeeplinkingIsReady}
    useResolvers={useDeeplinkingResolvers}
  >
    {children}
  </DeepLinkingProvider>
));
