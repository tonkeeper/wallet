import React from 'react';
import { TabBarBadgeIndicator } from '$navigation/MainStack/TabStack/TabBarBadgeIndicator';
import { useWalletStatus } from '@tonkeeper/shared/hooks';

export const BackupIndicator: React.FC = () => {
  const { lastBackupAt } = useWalletStatus();

  const isVisible = lastBackupAt === null;

  return <TabBarBadgeIndicator isVisible={isVisible} />;
};
