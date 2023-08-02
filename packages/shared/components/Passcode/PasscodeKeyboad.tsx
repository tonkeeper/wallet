import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Haptics, Icon, Text, useTheme } from '@tonkeeper/uikit';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// TODO: move to other file
import * as LocalAuthentication from 'expo-local-authentication';
export function detectBiometryType(types: LocalAuthentication.AuthenticationType[]) {
  let found = false;
  for (let type of types) {
    if (
      [
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ].indexOf(type) > -1
    ) {
      found = true;
      break;
    }
  }

  if (found) {
    return types.indexOf(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) > -1
      ? LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      : LocalAuthentication.AuthenticationType.FINGERPRINT;
  } else {
    return null;
  }
}

interface KeyboardKeyProps {
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const KeyboardKey = memo<KeyboardKeyProps>((props) => {
  const { onPress, children, disabled } = props;
  const animValue = useSharedValue(0);
  const theme = useTheme();

  const handlePressIn = useCallback(() => {
    animValue.value = withTiming(1, {
      duration: 50,
      easing: Easing.linear,
    });
  }, []);

  const handlePressOut = useCallback(() => {
    animValue.value = withTiming(0, {
      duration: 50,
      easing: Easing.linear,
    });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: animValue.value,
    transform: [
      {
        scale: interpolate(animValue.value, [0, 1], [0.75, 1]),
      },
    ],
  }));

  const bgHighlightStyle = {
    backgroundColor: theme.backgroundContent,
  };

  return (
    <TouchableOpacity
      style={styles.key}
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.keyCircle, style, bgHighlightStyle]} />
      <View style={styles.keyContent}>{children}</View>
    </TouchableOpacity>
  );
});

interface PasscodeKeyboardProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  biometryEnabled?: boolean;
  onBiometryPress?: () => void;
}

export const PasscodeKeyboard = memo<PasscodeKeyboardProps>((props) => {
  const {
    value,
    onChange,
    disabled = false,
    biometryEnabled = false,
    onBiometryPress,
  } = props;
  const [biometryType, setBiometryType] = useState(-1);

  useEffect(() => {
    if (biometryEnabled) {
      Promise.all([
        (async () => false)(), // MainDB.isBiometryEnabled(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]).then(([isEnabled, types]) => {
        if (isEnabled) {
          const type = detectBiometryType(types);
          if (type) {
            setBiometryType(type);
          }
        }
      });
    } else {
      setBiometryType(-1);
    }
  }, [biometryEnabled]);

  const handlePress = useCallback(
    (num: number) => () => {
      Haptics.selection();
      onChange?.(`${value}${num}`);
    },
    [onChange, value],
  );

  const handleBackspace = useCallback(() => {
    Haptics.selection();
    onChange?.(value?.substring(0, value.length - 1) ?? '');
  }, [onChange, value]);

  const nums = useMemo(() => {
    let result: Array<number>[] = [];
    for (let i = 0; i < 3; i++) {
      let line: number[] = [];
      for (let j = 0; j < 3; j++) {
        const num = j + 1 + i * 3;
        line.push(num);
      }

      result.push(line);
    }

    return result;
  }, []);

  const isFingerprint =
    biometryType === LocalAuthentication.AuthenticationType.FINGERPRINT;
  const isFace = LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;

  return (
    <View style={styles.container}>
      {nums.map((line, i) => (
        <View style={styles.line} key={`line-${i}`}>
          {line.map((num) => (
            <KeyboardKey
              key={`key-${num}`}
              onPress={handlePress(num)}
              disabled={disabled}
            >
              <Text type="h1">{num}</Text>
            </KeyboardKey>
          ))}
        </View>
      ))}
      <View style={styles.line} key="last">
        {onBiometryPress ? (
          <KeyboardKey disabled={disabled} onPress={onBiometryPress}>
            {isFingerprint ? (
              <Icon name="ic-fingerprint-36" color="iconPrimary" />
            ) : isFace ? (
              <Icon name="ic-faceid-36" color="iconPrimary" />
            ) : null}
          </KeyboardKey>
        ) : (
          <KeyboardKey disabled />
        )}
        <KeyboardKey onPress={handlePress(0)} disabled={disabled}>
          <Text type="h1">0</Text>
        </KeyboardKey>
        {value && value.length > 0 ? (
          <KeyboardKey onPress={handleBackspace} disabled={disabled}>
            <Icon name="ic-delete-36" color="iconPrimary" />
          </KeyboardKey>
        ) : (
          <KeyboardKey disabled />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keyCircle: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  keyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  key: {
    width: 72,
    height: 72,
    position: 'relative',
  },
});
