import { corners } from '../../styles/constants';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ListSeparator } from './ListSeparator';
import { useTheme } from '../../styles';
import { memo, useMemo } from 'react';

interface ListItemContainerProps {
  children?: React.ReactNode;
  endStyle?: ViewStyle;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ListItemContainer = memo<ListItemContainerProps>((props) => {
  const { isFirst, isLast, children, endStyle } = props;
  const colors = useTheme();
  const containerStyle = useMemo(
    () => [
      { backgroundColor: colors.backgroundContent },
      isLast && styles.bottomCorner,
      isLast && endStyle,
      isFirst && styles.topCorner,
      styles.container,
    ],
    [isFirst, isLast, colors],
  );

  return (
    <View style={containerStyle}>
      {children}
      {!isLast && <ListSeparator />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  topCorner: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  bottomCorner: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
    marginBottom: 8,
  },
});
