import { ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '../../styles';
import { Text } from '../Text';
import { View } from '../View';
import { useMemo } from 'react';
import { Spacer, SpacerSizes } from '../Spacer';

interface ListHeaderProps {
  rightContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  indentTop?: boolean;
  spacerY?: number;
  title: string;
}

export const ListHeader = (props: ListHeaderProps) => {
  const { title, indentTop, rightContent, spacerY, style } = props;

  const containerStyle = useMemo(
    () => [
      styles.container,
      indentTop && styles.indentTop,
      style,
    ],
    [indentTop, style],
  );

  return (
    <>
      {spacerY !== 0 && <Spacer y={spacerY} />}
      <View style={containerStyle}>
        <Text type="h3">{title}</Text>
        {rightContent}
      </View>
    </>
  );
};

const styles = Steezy.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  indentTop: {
    marginTop: 16,
  },
});
