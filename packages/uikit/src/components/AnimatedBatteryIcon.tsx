import { View } from './View';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Steezy, useTheme } from '../styles';
import { Icon } from './Icon';

export enum AnimatedBatterySize {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  ExtraSmall = 'extra-small',
}

export interface AnimatedBatteryIconProps {
  size: AnimatedBatterySize;
  progress: number;
  empty?: boolean;
  emptyAccent?: boolean;
}

const mapIconConfigBySize = {
  [AnimatedBatterySize.Large]: {
    width: 68,
    height: 114,
    top: 18,
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: 8,
  },
  [AnimatedBatterySize.Small]: {
    width: 20,
    height: 34,
    bottom: 3,
    left: 3,
    right: 3,
    top: 6,
    borderRadius: 2,
  },
};

export interface MappedSvgComponentProps {
  size: AnimatedBatterySize;
}

export function MappedSvgComponent(props: MappedSvgComponentProps) {
  const theme = useTheme();

  switch (props.size) {
    case AnimatedBatterySize.Small:
      return (
        <Svg width="20" height="34" viewBox="0 0 20 34" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.5331 3.01463C6.76939 1.31135 8.23141 0 9.99971 0C11.768 0 13.23 1.31135 13.4663 3.01461C15.6462 3.05886 16.9509 3.23708 17.9389 3.95492C18.3634 4.26331 18.7367 4.6366 19.0451 5.06107C20 6.3754 20 8.25027 20 12V25C20 28.7497 20 30.6246 19.0451 31.9389C18.7367 32.3634 18.3634 32.7367 17.9389 33.0451C16.6246 34 14.7497 34 11 34H9C5.25027 34 3.3754 34 2.06107 33.0451C1.6366 32.7367 1.26331 32.3634 0.954915 31.9389C0 30.6246 0 28.7497 0 25V12C0 8.25027 0 6.3754 0.954915 5.06107C1.26331 4.6366 1.6366 4.26331 2.06107 3.95492C3.049 3.23715 4.35362 3.05889 6.5331 3.01463ZM1.5 10.8C1.5 8.17519 1.5 6.86278 2.16844 5.94275C2.38432 5.64562 2.64562 5.38432 2.94275 5.16844C3.86278 4.5 5.17519 4.5 7.8 4.5H12.2C14.8248 4.5 16.1372 4.5 17.0572 5.16844C17.3544 5.38432 17.6157 5.64562 17.8316 5.94275C18.5 6.86278 18.5 8.17519 18.5 10.8V26.2C18.5 28.8248 18.5 30.1372 17.8316 31.0572C17.6157 31.3544 17.3544 31.6157 17.0572 31.8316C16.1372 32.5 14.8248 32.5 12.2 32.5H7.8C5.17519 32.5 3.86278 32.5 2.94275 31.8316C2.64562 31.6157 2.38432 31.3544 2.16844 31.0572C1.5 30.1372 1.5 28.8248 1.5 26.2V10.8Z"
            fill={theme.iconTertiary}
            opacity={0.64}
          />
        </Svg>
      );
    case AnimatedBatterySize.Large:
      return (
        <Svg width="68" height="114" viewBox="0 0 68 114" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23.0435 10.0162C23.5411 4.40199 28.2565 0 34.0001 0C39.7437 0 44.4591 4.40199 44.9567 10.0162C53.2387 10.0931 57.9328 10.5333 61.4046 13.0557C62.7629 14.0426 63.9574 15.2371 64.9443 16.5954C68 20.8013 68 26.8009 68 38.8V85.2C68 97.1991 68 103.199 64.9443 107.405C63.9574 108.763 62.7629 109.957 61.4046 110.944C57.1987 114 51.1991 114 39.2 114H28.8C16.8009 114 10.8013 114 6.59544 110.944C5.23712 109.957 4.0426 108.763 3.05573 107.405C0 103.199 0 97.1991 0 85.2V38.8C0 26.8009 0 20.8013 3.05573 16.5954C4.0426 15.2371 5.23712 14.0426 6.59544 13.0557C10.0673 10.5333 14.7614 10.0931 23.0435 10.0162ZM4 35.6C4 26.6006 4 22.101 6.2918 18.9466C7.03195 17.9278 7.92784 17.032 8.94658 16.2918C12.101 14 16.6006 14 25.6 14H42.4C51.3994 14 55.899 14 59.0534 16.2918C60.0722 17.032 60.968 17.9278 61.7082 18.9466C64 22.101 64 26.6006 64 35.6V88.4C64 97.3994 64 101.899 61.7082 105.053C60.968 106.072 60.0722 106.968 59.0534 107.708C55.899 110 51.3994 110 42.4 110H25.6C16.6006 110 12.101 110 8.94658 107.708C7.92784 106.968 7.03195 106.072 6.2918 105.053C4 101.899 4 97.3994 4 88.4V35.6Z"
            fill={theme.iconTertiary}
            opacity={0.64}
          />
        </Svg>
      );
    default:
      return null;
  }
}

const inRange = (value: number, start: number, end: number) =>
  Math.min(end, Math.max(start, value));

const MIN_PROGRESS_RANGE = 0.14;

export function AnimatedBatteryIcon(props: AnimatedBatteryIconProps) {
  const iconConfig = mapIconConfigBySize[props.size];
  const bodyStyle = Steezy.useStyle(styles.batteryBody);
  const emptyBodyStyle = Steezy.useStyle(styles.emptyBatteryBody);
  const progress = inRange(props.progress ?? 0, MIN_PROGRESS_RANGE, 1);

  const batteryBodyAnimatedStyle = useAnimatedStyle(
    () => ({
      height: withTiming(
        interpolate(
          progress,
          [0, 1],
          [0, iconConfig.height - iconConfig.top - iconConfig.bottom],
        ),
        { duration: 400 },
      ),
    }),
    [iconConfig, progress],
  );

  return (
    <View
      style={[
        styles.relativeContainer,
        { height: iconConfig.height, width: iconConfig.width },
      ]}
    >
      <MappedSvgComponent size={props.size} />
      <View
        style={[
          styles.batteryBodyContainer,
          {
            position: 'absolute',
            left: iconConfig.left,
            right: iconConfig.right,
            bottom: iconConfig.bottom,
            top: iconConfig.top,
            justifyContent: 'flex-end',
          },
        ]}
      >
        {props.empty ? (
          <View style={styles.emptyIconContainer}>
            <Icon
              name="ic-flash-16"
              size={props.size === AnimatedBatterySize.Small ? 16 : 48}
              color={props.emptyAccent ? 'accentBlue' : 'iconSecondary'}
            />
          </View>
        ) : (
          <Animated.View
            style={[
              bodyStyle,
              {
                width: '100%',
                borderRadius: iconConfig.borderRadius,
              },
              batteryBodyAnimatedStyle,
              progress === MIN_PROGRESS_RANGE && emptyBodyStyle,
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = Steezy.create(({ colors }) => ({
  relativeContainer: {
    position: 'relative',
  },
  batteryBodyContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  batteryBody: {
    backgroundColor: colors.accentBlue,
  },
  emptyBatteryBody: {
    backgroundColor: colors.accentOrange,
  },
  emptyIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
