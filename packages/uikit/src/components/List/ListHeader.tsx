import { Steezy } from '../../styles';
import { Text } from '../Text';
import { View } from '../View';

interface ListHeaderProps {
  rightContent?: React.ReactNode;
  indentTop?: boolean;
  title: string;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  title,
  indentTop,
  rightContent,
}) => (
  <View style={[styles.container, indentTop && styles.indentTop]}>
    <Text type="h3">{title}</Text>
    {rightContent}
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
