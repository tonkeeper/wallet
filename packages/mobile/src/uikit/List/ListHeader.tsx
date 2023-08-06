import React from 'react';
import { Text } from '../Text/Text';
import { Steezy } from '$styles';
import { View } from '@tonkeeper/uikit';

interface ListHeaderProps {
  title: string;
  indentTop?: boolean;
  rightContent?: () => React.ReactNode;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  title,
  indentTop,
  rightContent,
}) => (
  <View style={[styles.container, indentTop && styles.indentTop]}>
    <Text variant="h3">{title}</Text>
    {rightContent && rightContent()}
  </View>
);

const styles = Steezy.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indentTop: {
    marginTop: 16,
  },
});
