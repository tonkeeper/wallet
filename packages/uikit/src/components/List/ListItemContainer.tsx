import { corners } from '../../styles/constants';
import { View, StyleSheet } from 'react-native';
import { ListSeparator } from './ListSeparator';
import { useTheme } from '../../styles';
import { memo, useMemo } from 'react';

interface ListItemContainerProps {
  children?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ListItemContainer = memo<ListItemContainerProps>((props) => {
  const { isFirst, isLast, children } = props;
  const colors = useTheme();
  const containerStyle = useMemo(
    () => [
      { backgroundColor: colors.backgroundContent },
      isLast && styles.bottomCorner,
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
