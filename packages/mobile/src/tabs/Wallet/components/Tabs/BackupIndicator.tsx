import React from 'react';
import { useWalletSetup } from '@tonkeeper/shared/hooks';
import { Steezy, View } from '@tonkeeper/uikit';

export const BackupIndicator: React.FC = () => {
  const { lastBackupAt } = useWalletSetup();

  const isVisible = lastBackupAt === null;

  if (!isVisible) {
    return null;
  }

  return <View style={styles.indicator} />;
};

const styles = Steezy.create(({ colors }) => ({
  indicator: {
    position: 'absolute',
    top: 10,
    right: 4,
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.accentRed,
  },
}));
