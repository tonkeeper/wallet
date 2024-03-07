import React from 'react';
import { TabBarBadgeIndicator } from '$navigation/MainStack/TabStack/TabBarBadgeIndicator';
import { useWalletSetup } from '@tonkeeper/shared/hooks';

export const BackupIndicator: React.FC = () => {
  const { lastBackupAt } = useWalletSetup();

  const isVisible = lastBackupAt === null;

  return <TabBarBadgeIndicator isVisible={isVisible} />;
};
