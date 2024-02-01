import React, { memo, ReactNode } from 'react';
import { View } from '../View';
import { Steezy } from '../../styles';

export interface TableContainerProps {
  children: ReactNode;
}

export const TableContainer = memo<TableContainerProps>((props) => {
  return <View style={styles.container}>{props.children}</View>;
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.backgroundContent,
    paddingVertical: 12,
    borderRadius: 16,
  },
}));
