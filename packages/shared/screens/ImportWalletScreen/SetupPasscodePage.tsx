import { PasscodeDots, PasscodeDotsRef } from '../../components/Passcode/PasscodeDots';
import { PasscodeKeyboard } from '../../components/Passcode/PasscodeKeyboad';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { delay } from '@tonkeeper/uikit/src/utils/delay';
import { Steezy, View, Text } from '@tonkeeper/uikit';
import { useWindowDimensions } from 'react-native';
import { t } from '../../i18n';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface SetupPasscodePageProps {
  onComplete: (passcode: string) => void;
  shown: boolean;
}

enum PasscodeState {
  Current,
  Create,
  Repeat,
}

export const SetupPasscodePage = memo<SetupPasscodePageProps>((props) => {
  const { shown, onComplete } = props;

  const validateOldPin = false;
  const onPinCreated = async (passcode: string) => {
    onComplete(passcode);
    await delay(500);
    pinRef.current?.clearState();
    setValue1('');
    setValue2('');
    setStep(PasscodeState.Create);
  };

  const checkPasscode = async (passcode: string) => {
    return true;
  };

  const dimensions = useWindowDimensions();
  const pinRef = useRef<PasscodeDotsRef>(null);
  const oldPinRef = useRef<PasscodeDotsRef>(null);
  const [step, setStep] = useState(
    validateOldPin ? PasscodeState.Current : PasscodeState.Create,
  );
  const [stepAfterAnimation, setStepAfterAnimation] = useState(
    validateOldPin ? PasscodeState.Current : PasscodeState.Create,
  );
  const [value0, setValue0] = useState('');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [isAnimating, setAnimation] = useState(false);

  const stepsValue = useSharedValue(validateOldPin ? -1 : 0);

  const onStepAnimationCompleted = useCallback(() => {
    setValue2('');
    setAnimation(false);
    setStepAfterAnimation(step);
  }, [step]);

  useEffect(() => {
    setAnimation(true);

    let newVal = 0;
    if (step === PasscodeState.Current) {
      newVal = -1;
    } else if (step === PasscodeState.Repeat) {
      newVal = 1;
    }

    stepsValue.value = withDelay(
      500,
      withTiming(
        newVal,
        {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(onStepAnimationCompleted)();
          }
        },
      ),
    );
  }, [onStepAnimationCompleted, step, stepsValue]);

  const handleKeyboard = useCallback(
    async (newValue: string) => {
      const pin = newValue.substring(0, 4);

      switch (step) {
        case PasscodeState.Current:
          setValue0(pin);
          if (pin.length === 4) {
            const pass = await checkPasscode(pin);
            if (pass) {
              oldPinRef.current?.triggerSuccess();

              await delay(400);

              setStep(PasscodeState.Create);
            } else {
              oldPinRef.current?.triggerError();
              setValue0('');
            }
          }
          break;
        case PasscodeState.Create:
          setValue1(pin);
          if (pin.length === 4) {
            setStep(PasscodeState.Repeat);
          }
          break;
        case PasscodeState.Repeat:
          setValue2(pin);
          if (pin.length === 4) {
            if (value1 === pin) {
              await delay(500);

              // wait pulse animation completion
              pinRef.current?.triggerSuccess();

              await delay(250);

              onPinCreated(pin);
            } else {
              await delay(500);

              setValue1('');
              setValue2('');
              pinRef.current?.triggerError();

              await delay(450);

              setStep(PasscodeState.Create);
            }
          }
          break;
      }
    },
    [onPinCreated, step, value1, checkPasscode],
  );

  const stepsStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          stepsValue.value,
          [-1, 0, 1],
          [0, -dimensions.width, -dimensions.width * 2],
        ),
      },
    ],
  }));

  const value = useMemo(() => {
    if (stepAfterAnimation === PasscodeState.Current) {
      return value0;
    } else if (stepAfterAnimation === PasscodeState.Create) {
      return value1;
    } else {
      return value2;
    }
  }, [step, value0, value1, value2, stepAfterAnimation]);

  const stepStyle = { width: dimensions.width };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.steps.static, stepsStyle]}>
        <View style={[styles.step, stepStyle]}>
          <View style={styles.pinWrap}>
            <Text type="h3">{t('create_pin_current_title')}</Text>
            <View style={styles.pin}>
              <PasscodeDots value={value0} ref={oldPinRef} />
            </View>
          </View>
        </View>
        <View style={[styles.step, stepStyle]}>
          <View style={styles.pinWrap}>
            <Text type="h3">
              {validateOldPin ? t('create_pin_new_title') : 'Create passcode'}
            </Text>
            <View style={styles.pin}>
              <PasscodeDots value={value1} />
            </View>
          </View>
        </View>
        <View style={[styles.step, stepStyle]}>
          <View style={styles.pinWrap}>
            <Text type="h3">{t('create_pin_repeat_title')}</Text>
            <View style={styles.pin}>
              <PasscodeDots value={value2} ref={pinRef} />
            </View>
          </View>
        </View>
      </Animated.View>
      <PasscodeKeyboard onChange={handleKeyboard} disabled={isAnimating} value={value} />
    </View>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    flex: 1,
    overflow: 'hidden',
    paddingBottom: safeArea.bottom,
  },
  steps: {
    paddingBottom: 2.5,
    flexDirection: 'row',
    flex: 1,
  },
  step: {
    flex: 0,
  },
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pin: {
    marginTop: 20,
    height: 12,
  },
}));
