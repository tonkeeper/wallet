import { ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '../../styles';
import { Text } from '../Text';
import { View } from '../View';
import { useMemo } from 'react';
import { Spacer, SpacerSizes } from '../Spacer';
import { TTextTypes } from '../Text/TextStyles';

interface ListHeaderProps {
  marginHorizontal?: boolean;
  rightContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  indentTop?: boolean;
  spacerY?: number;
  title: string;
  titleTextType?: TTextTypes;
}

export const ListHeader = (props: ListHeaderProps) => {
  const {
    titleTextType = 'h3',
    title,
    indentTop,
    rightContent,
    spacerY,
    style,
    marginHorizontal,
  } = props;

  const containerStyle = useMemo(
    () => [
      styles.container,
      indentTop && styles.indentTop,
      marginHorizontal && styles.marginHorizontal,
      style,
    ],
    [indentTop, style],
  );

  return (
    <>
      {spacerY !== 0 && <Spacer y={spacerY} />}
      <View style={containerStyle}>
        <Text type={titleTextType}>{title}</Text>
        {rightContent}
      </View>
    </>
  );
};

const styles = Steezy.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginHorizontal: {
    marginHorizontal: 16,
  },
  indentTop: {
    marginTop: 16,
  },
});
