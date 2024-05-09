import { Icon, Text, View, ns, useTheme } from '@tonkeeper/uikit';
import { FC } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { LedgerConnectionCurrentStep } from './types';
import { Steezy } from '$styles';
import Animated, {
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

const BluetoothIcon = () => {
  return (
    <Svg width={ns(42)} height={ns(56)} viewBox="0 0 42 56" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 56C33.4395 56 42 50.216 42 28C42 5.84977 33.4395 0 21 0C8.56051 0.0657277 0 5.84976 0 28.0657C0 50.216 8.56051 56 21 56Z"
        fill="#0082FC"
      />
      <Path
        d="M11 38L31 18L21 8V48L31 38L11 18"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="square"
      />
    </Svg>
  );
};

const LedgerPicture = () => {
  const theme = useTheme();
  return (
    <Svg width={ns(353)} height={ns(56)} viewBox="0 0 353 56" fill="none">
      <Path
        opacity={0.64}
        d="M0 6.4C0 4.15979 0 3.03968 0.435974 2.18404C0.819467 1.43139 1.43139 0.819467 2.18404 0.435974C3.03968 0 4.15979 0 6.4 0H176C191.464 0 204 12.536 204 28C204 43.464 191.464 56 176 56H6.39999C4.15979 56 3.03968 56 2.18404 55.564C1.43139 55.1805 0.819467 54.5686 0.435974 53.816C0 52.9603 0 51.8402 0 49.6V6.4Z"
        fill={theme.iconTertiary}
      />
      <Circle opacity={0.24} cx={28} cy={28} r={14} fill={theme.backgroundContent} />
      <Circle
        opacity={0.56}
        cx={28}
        cy={28}
        r={15}
        stroke={theme.iconSecondary}
        strokeWidth={2}
      />
      <Path
        d="M149 28C149 43.464 161.536 56 177 56L353 56V1.52588e-05L177 1.52588e-05C161.536 1.52588e-05 149 12.536 149 28Z"
        fill={theme.iconTertiary}
      />
      <Circle opacity={0.24} cx={177} cy={28} r={14} fill={theme.backgroundContent} />
      <Path
        opacity={0.48}
        d="M52 11.2C52 10.0799 52 9.51984 52.218 9.09202C52.4097 8.71569 52.7157 8.40973 53.092 8.21799C53.5198 8 54.0799 8 55.2 8H137.8C138.92 8 139.48 8 139.908 8.21799C140.284 8.40973 140.59 8.71569 140.782 9.09202C141 9.51984 141 10.0799 141 11.2V44.8C141 45.9201 141 46.4802 140.782 46.908C140.59 47.2843 140.284 47.5903 139.908 47.782C139.48 48 138.92 48 137.8 48H55.2C54.0799 48 53.5198 48 53.092 47.782C52.7157 47.5903 52.4097 47.2843 52.218 46.908C52 46.4802 52 45.9201 52 44.8V11.2Z"
        fill={theme.backgroundContent}
      />
      <Path
        opacity={0.44}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M177 42C184.732 42 191 35.732 191 28C191 20.268 184.732 14 177 14C169.268 14 163 20.268 163 28C163 35.732 169.268 42 177 42ZM177 44C185.837 44 193 36.8366 193 28C193 19.1634 185.837 12 177 12C168.163 12 161 19.1634 161 28C161 36.8366 168.163 44 177 44Z"
        fill={theme.iconSecondary}
      />
    </Svg>
  );
};

const LEDGER_POS = ns(24);
const LEDGER_CONNECTED_POS = ns(-42);

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

interface Props {
  currentStep: LedgerConnectionCurrentStep;
  showConfirmTxStep?: boolean;
}

export const LegderView: FC<Props> = (props) => {
  const { currentStep, showConfirmTxStep } = props;

  const bluetoothStyle = useAnimatedStyle(
    () => ({
      opacity: currentStep === 'connect' ? withDelay(200, withTiming(1)) : withTiming(0),
    }),
    [currentStep],
  );

  const ledgerStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX:
            currentStep === 'connect'
              ? withDelay(200, withTiming(LEDGER_POS))
              : withTiming(LEDGER_CONNECTED_POS, { duration: 350 }),
        },
      ],
    }),
    [currentStep],
  );

  const textStyle = useAnimatedStyle(
    () => ({
      opacity: currentStep === 'connect' ? withTiming(0) : withDelay(150, withTiming(1)),
    }),
    [currentStep],
  );

  return (
    <View style={styles.container}>
      <Animated.View style={bluetoothStyle}>
        <BluetoothIcon />
      </Animated.View>
      <Animated.View style={[styles.ledger.static, ledgerStyle]}>
        <LedgerPicture />
        <Animated.View style={[styles.textWrapper.static, textStyle]}>
          <View style={styles.textContainer}>
            {currentStep === 'all-completed' && showConfirmTxStep ? (
              <Icon name="ic-done-16" color="iconSecondary" />
            ) : (
              <Text type="body3" style={{ fontFamily }} color="textSecondary">
                {currentStep === 'confirm-tx' ? 'Review' : 'TON ready'}
              </Text>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    width: '100%',
    paddingTop: 40,
    paddingLeft: 40,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledger: {
    position: 'relative',
    transform: [{ translateX: LEDGER_POS }],
  },
  textWrapper: {
    position: 'absolute',
    top: 8,
    left: 52,
  },
  textContainer: {
    width: 89,
    height: 40,
    backgroundColor: colors.backgroundContent,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
}));
