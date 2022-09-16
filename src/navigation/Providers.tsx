import React, { memo } from 'react';
import { DeepLinkingProvider } from '$libs/deeplinking';
import { AttachScreenProvider } from './AttachScreen';
import { useDeeplinkingResolvers } from './hooks/useDeeplinkingResolvers';
import { useDeeplinkingIsReady } from './hooks/useDeeplinkingIsReady';
import { NotificationsBadgeProvider } from '$hooks/useNotificationsBadge';
import { ErrorBoundary } from '$shared/components/ErrorBoundary';
import { SkeletonProvider } from '$uikit/Skeleton';


export const ProvidersWithoutNavigation = memo(({ children }) => (
  <SkeletonProvider>
    <NotificationsBadgeProvider>
      <AttachScreenProvider>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </AttachScreenProvider>
    </NotificationsBadgeProvider>
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