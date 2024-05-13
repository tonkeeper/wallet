import { Text } from '../../../components/Text';
import { Icon } from '../../../components/Icon';
import { TouchableOpacity } from '../../../components/TouchableOpacity';
import { View } from '../../../components/View';
import { Steezy } from '../../../styles';
import { memo } from 'react';
import { isString } from '../../../utils/strings';
import { useNavigation } from '@tonkeeper/router';
import { StatusBar } from 'react-native';
import { isAndroid, isIOS } from '../../../utils';

export interface ScreenModalHeaderProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  titlePosition?: 'center' | 'left';
}

export const ScreenModalHeader = memo<ScreenModalHeaderProps>((props) => {
  const { title, titlePosition = 'center' } = props;
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      {isIOS && <StatusBar barStyle="light-content" />}
      <TouchableOpacity
        style={[
          styles.closeButton,
          titlePosition === 'center' ? styles.leftButton : styles.rightButton,
        ]}
        onPress={() => nav.goBack()}
        activeOpacity={0.6}
      >
        <View style={styles.close}>
          <Icon name="ic-chevron-down-16" color="buttonSecondaryForeground" />
        </View>
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        {isString(title) ? (
          <Text type="h3" textAlign={titlePosition}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
    </View>
  );
});

const styles = Steezy.create(({ colors, safeArea }) => ({
  container: {
    marginTop: isAndroid ? safeArea.top : 0,
    height: 64,
    justifyContent: 'center',
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
  rightButton: {
    right: 0,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));
