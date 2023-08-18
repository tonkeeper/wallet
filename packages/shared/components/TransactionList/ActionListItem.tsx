import { ActionStatusEnum } from '@tonkeeper/core/src/legacy';
import { Steezy } from '@tonkeeper/uikit';
import { useMemo } from 'react';
import { t } from '../../i18n';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Icon,
  IconNames,
  List,
  Loader,
  useTheme,
  SText as Text,
  View,
} from '@tonkeeper/uikit';
import { CustomAccountEvent } from '@tonkeeper/core/src/TonAPI';

interface ActionListItem {
  icon?: IconNames;
  title?: string;
  subtitle?: string;

  children?: React.ReactNode;
  event: CustomAccountEvent;
  status?: ActionStatusEnum;
}

const useBackgroundHighlighted = () => {
  const theme = useTheme();
  const isPressed = useSharedValue(0);
  const onPressIn = () => (isPressed.value = 1);
  const onPressOut = () => (isPressed.value = 0);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed.value,
      [0, 1],
      [theme.backgroundContentTint, theme.backgroundHighlighted],
    ),
  }));

  return {
    backgroundStyle,
    onPressOut,
    onPressIn,
  };
};

export const ActionListItem = (props: ActionListItem) => {
  const { event, icon, title, status, children } = props;
  const { onPressOut, onPressIn, backgroundStyle } = useBackgroundHighlighted();

  // senderAddress;
  // const amountPrefix = isReceive ? '+' : '−';

  const defaultTitle = useMemo(() => {
    if (title) {
      return title;
    } else if (event.destination === 'in') {
      return t('transaction_type_receive');
    } else if (event.destination === 'out') {
      return t('transaction_type_sent');
    } else {
      return t('transaction_type_sent');
    }
  }, [event.destination, title]);

  const iconName = useMemo(() => {
    if (icon) {
      return icon;
    } else if (event.destination === 'in') {
      return 'ic-tray-arrow-down-28';
    } else if (event.destination === 'out') {
      return 'ic-tray-arrow-up-28';
    } else {
      return 'ic-gear-28';
    }
  }, [event.destination, icon]);

  return (
    <List.Item
      title={defaultTitle}
      leftContent={
        <Animated.View style={[styles.icon.static, backgroundStyle]}>
          {/* {!!item.picture ? (
        <FastImage
          resizeMode="cover"
          source={{
            uri: item.picture,
          }}
          style={{ width: 44, height: 44, borderRadius: 44 / 2 }}
        />
      ) : (
        <> */}
          <Icon name={iconName} color="iconSecondary" />
          {event.in_progress && (
            <View style={styles.sendingOuter}>
              <View style={styles.sendingInner}>
                <Loader size="xsmall" color="constantWhite" />
              </View>
            </View>
          )}
          {/* </>
      )} */}
        </Animated.View>
      }
    >
      {children}
      {status === ActionStatusEnum.Failed && (
        <Text type="body2" color="accentOrange" style={styles.failedText}>
          {t('transactions.failed')}
        </Text>
      )}
    </List.Item>
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  icon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
  },
  receiveValue: {
    color: colors.accentGreen,
    textAlign: 'right',
  },
  amount: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
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
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
  comment: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    paddingTop: 7.5,
    paddingBottom: 8.5,
  },
  timeText: {
    textAlign: 'right',
  },
  failedText: {
    marginTop: 8,
  },
  scamAmountText: {
    color: colors.textTertiary,
  },
  sendingOuter: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 18 + 2 / 2,

    borderWidth: 2,
    borderColor: colors.backgroundContent,
  },
  sendingInner: {
    borderRadius: 18 / 2,
    height: 18,
    width: 18,
    backgroundColor: colors.iconTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
