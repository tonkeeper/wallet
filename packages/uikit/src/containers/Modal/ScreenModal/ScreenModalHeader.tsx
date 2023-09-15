import { Text } from '../../../components/Text';
import { Icon } from '../../../components/Icon';
import { TouchableOpacity } from '../../../components/TouchableOpacity';
import { View } from '../../../components/View';
import { Steezy } from '../../../styles';
import { memo } from 'react';
import { isString } from '../../../utils/strings';
import { useNavigation } from '@tonkeeper/router';

export interface ScreenModalHeaderProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
}

export const ScreenModalHeader = memo<ScreenModalHeaderProps>((props) => {
  const { title } = props;
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.closeButton, styles.leftButton]}
        onPress={() => nav.goBack()}
        activeOpacity={0.6}
      >
        <View style={styles.close}>
          <Icon name="ic-chevron-down-16" color="constantWhite" />
        </View>
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        {isString(title) ? (
          <Text type="h3" textAlign="center">
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 24,
    justifyContent: 'center',
  },
  closeButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  leftButton: {
    left: 0,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContent,
  },
}));
