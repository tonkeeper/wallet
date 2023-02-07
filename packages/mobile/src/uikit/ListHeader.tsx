import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text/Text';

interface ListHeaderProps {
  title: string;
  indentTop?: boolean;
  rightContent?: () => React.ReactNode;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ title, indentTop, rightContent }) => (
  <View style={[styles.container, indentTop && styles.indentTop]}>
    <Text variant="label1">
      {title}
    </Text>
    {rightContent && rightContent()}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  indentTop: {
    marginTop: 16
  }
});
