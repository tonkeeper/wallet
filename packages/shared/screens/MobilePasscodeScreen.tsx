import { Button, Steezy, View, useValueRef } from '@tonkeeper/uikit';
import { PasscodeShowOptions } from '@tonkeeper/core';
import { memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { PasscodeInput, PasscodeInputRef } from '../components/PasscodeInput';
import { PasscodeKeyboard } from '../components/PasscodeKeyboad';
import { delay } from '@tonkeeper/uikit/src/utils/delay';
import { FullWindowOverlay } from 'react-native-screens';
import { Alert } from 'react-native';
import { t } from '../i18n';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
// import { MobilePasscodeController } from './PasscodeController';

interface PasscodeScreenProps {
  locked?: boolean;
}

export const MobilePasscodeScreen = memo<PasscodeScreenProps>((props) => {
  const { locked } = props;
  const [isPasscodeShown, setPasscodeShown] = useState(locked);
  const animation = useSharedValue(isPasscodeShown ? 1 : 0);
  const _options = useValueRef<PasscodeShowOptions | null>(null);

  const finishHideAnimation = () => {
    setPasscodeShown(false);
    _options.setValue(null);
  };

  const hidePasscode = () => {
    animation.value = withTiming(0, { duration: 150 }, (finish) => {
      if (finish) {
        runOnJS(finishHideAnimation)();
      }
    });
  };

  const handleLogoutPress = useCallback(() => {
    _options.value?.onLogout?.();
  }, []);

  const handleBiometryPress = useCallback(() => {
    _options.value?.onPressBiometry?.();
  }, []);

  const handleEnterPasscode = useCallback(async (passcode: string) => {
    return _options.value?.onEnter?.(passcode);
  }, []);

  useImperativeHandle({}, () => ({
    hide: hidePasscode,
    show(options) {
      setPasscodeShown(true);
      _options.setValue(options);
      animation.value = withTiming(1, { duration: 150 });
    },
  }));

  if (isPasscodeShown) {
    return (
      <FullWindowOverlay>
        <PasscodeComponent
          onBiometryPress={handleBiometryPress}
          onLogoutPress={handleLogoutPress}
          onEnter={handleEnterPasscode}
          onHide={hidePasscode}
          animation={animation}
        />
      </FullWindowOverlay>
    );
  }

  return null;
});

interface PasscodeComponentProps {
  animation: Animated.SharedValue<number>;
  onEnter: (passcode: string) => Promise<void>;
  onBiometryPress: () => void;
  onLogoutPress: () => void;
  onHide: () => void;
}

const PasscodeComponent = memo<PasscodeComponentProps>((props) => {
  const { onBiometryPress, onLogoutPress, onEnter, onHide, animation } = props;
  const [biometryFailed, setBiometryFailed] = useState(false);
  const [passcode, setPasscode] = useState('');
  const inputRef = useRef<PasscodeInputRef>(null);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0, 1], [0, 1]),
      transform: [
        {
          scale: interpolate(animation.value, [0, 1], [1.1, 1]),
        },
      ],
    };
  });

  const handleLogoutPress = useCallback(() => {
    Alert.alert(t('settings_reset_alert_title'), t('settings_reset_alert_caption'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_reset_alert_button'),
        style: 'destructive',
        onPress: onLogoutPress,
      },
    ]);
  }, []);

  const handleKeyboard = useCallback(async (value: string) => {
    setPasscode(value);
    if (value.length === 4) {
      await delay(400);
      onEnter(value)
        .then(async () => {
          inputRef.current?.triggerSuccess();
          await delay(400);
          onHide();
        })
        .catch(() => {
          inputRef.current?.triggerError();
          setPasscode('');
        });
    }
  }, []);

  // const handleBiometry = useCallback(() => {
  //   vault
  //     .unlock()
  //     .then((unlockedVault) => {
  //       inputRef.current?.triggerSuccess();

  //       setTimeout(() => {
  //         if (isUnlock) {
  //           dispatch(mainActions.setUnlocked(true));
  //         } else {
  //           goBack();
  //           promise.resolve(unlockedVault);
  //         }
  //       }, 500);
  //     })
  //     .catch((e) => {
  //       Toast.fail(e.message, { size: ToastSize.Small });
  //       setBiometryFailed(true);
  //       triggerError();
  //     });
  // }, [dispatch, isUnlock, triggerError, wallet]);

  return (
    <Animated.View style={[styles.flex.static, containerStyle]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            onPress={handleLogoutPress}
            size="small"
            color="secondary"
            title="Log out"
          />
        </View>
        <PasscodeInput
          label={t('access_confirmation_title')}
          value={passcode}
          ref={inputRef}
        />
        <PasscodeKeyboard
          disabled={passcode.length === 4}
          onBiometryPress={onBiometryPress}
          biometryEnabled={!biometryFailed}
          onChange={handleKeyboard}
          value={passcode}
        />
      </View>
    </Animated.View>
  );
});

const styles = Steezy.create(({ colors, safeArea }) => ({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPage,
    paddingBottom: safeArea.bottom,
  },
  header: {
    height: 64,
    marginTop: safeArea.top,
    alignItems: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
}));
