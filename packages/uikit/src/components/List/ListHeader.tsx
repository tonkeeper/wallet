import { ViewStyle } from 'react-native';
import { Steezy, StyleProp } from '../../styles';
import { Text } from '../Text';
import { View } from '../View';
import { useMemo } from 'react';
import { Spacer, SpacerSizes } from '../Spacer';
import { TTextTypes } from '../Text/TextStyles';

interface ListHeaderProps {
  rightContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  indentTop?: boolean;
  indent?: boolean;
  spacerY?: SpacerSizes;
  title: string;
  titleTextType?: TTextTypes;
}

export const ListHeader = (props: ListHeaderProps) => {
  const {
    title,
    titleTextType = 'h3',
    indentTop,
    indent,
    rightContent,
    spacerY,
    style,
  } = props;

  const containerStyle = useMemo(
    () => [
      styles.container,
      indentTop && styles.indentTop,
      indent && styles.indentHorizontal,
      style,
    ],
    [indentTop, style],
  );

  return (
    <>
      {!!spacerY && <Spacer y={spacerY} />}
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
  indentTop: {
    marginTop: 16,
  },
  indentHorizontal: {
    marginHorizontal: 16,
  },
});
