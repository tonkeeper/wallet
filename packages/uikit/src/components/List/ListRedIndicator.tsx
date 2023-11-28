import { Steezy } from '../../styles';
import { View } from '../View';

export const ListRedIndicator = () => {
  return <View style={styles.container} />;
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    width: 7,
    height: 7,
    borderRadius: 7 / 2,
    backgroundColor: colors.accentRed,
    marginLeft: 6.2,
    marginTop: 2,
  },
}));
