import { Steezy } from '../../styles';
import { View } from '../View';
import { memo } from 'react';

export interface ListSeparatorProps {
  absolute?: boolean;
  toTop?: boolean;
  leftOffset?: number;
}

export const ListSeparator = memo<ListSeparatorProps>((props) => {
  const { leftOffset = 16 } = props;
  const separatorOffsetStyle = { marginLeft: leftOffset };

  return (
    <View style={styles.container}>
      <View style={[styles.separator, separatorOffsetStyle]} />
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.separatorCommon,
    zIndex: 1,
    height: 0,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.separatorCommon,
    marginTop: -0.5,
  },
}));
