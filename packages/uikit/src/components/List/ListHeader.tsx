import { ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '../../styles';
import { Text } from '../Text';
import { View } from '../View';
import { useMemo } from 'react';

interface ListHeaderProps {
  rightContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  indentTop?: boolean;
  title: string;
}

export const ListHeader = (props: ListHeaderProps) => {
  const { title, indentTop, rightContent, style } = props;

  const containerStyle = useMemo(
    () => [styles.container, indentTop && styles.indentTop, style],
    [indentTop, style],
  );

  return (
    <View style={containerStyle}>
      <Text type="h3">{title}</Text>
      {rightContent}
    </View>
  );
};

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
