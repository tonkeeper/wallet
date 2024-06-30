import { ListItemContent } from './ListItemContent';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../styles';
import { memo } from 'react';
import { ShowMore } from '../ShowMore';
import { Text } from '../Text';

interface ListItemContentTextProps {
  children?: React.ReactNode;
  text?: string;
}

export const ListItemContentText = memo<ListItemContentTextProps>((props) => {
  const { children, text } = props;
  const theme = useTheme();
  return (
    <ListItemContent style={styles.content}>
      {!!text ? (
        <Text numberOfLines={1} type="body2">
          {text}
        </Text>
      ) : (
        children
      )}
    </ListItemContent>
  );
});

const styles = StyleSheet.create({
  content: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    paddingTop: 7.5,
    paddingBottom: 8.5,
  },
});
