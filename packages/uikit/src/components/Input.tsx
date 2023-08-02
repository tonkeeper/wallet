import { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { TextInputRef, TextInput, TextInputProps } from './TextInput';
import Clipboard from '@react-native-community/clipboard';
import { corners } from '../styles/constants';
import { Steezy, useTheme } from '../styles';
import { Font } from './Text/TextStyles';
import { isAndroid } from '../utils';
import { View } from './View';
import { Text } from './Text';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  cancelAnimation,
  useSharedValue,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import {
  TextInputFocusEventData,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { TextStyle } from 'react-native';

type FocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;

interface InputProps extends TextInputProps {
  onLayout?: (ev: LayoutChangeEvent) => void;
  onChangeText?: (text: string) => void;
  onScanPress?: () => void;
  indentBottom?: WithDefault<boolean, false>;
  disableAutoMarkValid?: boolean;
  leftContent?: React.ReactNode;
  withPasteButton?: boolean;
  withScanButton?: boolean;
  autoFocusDelay?: number;
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  invalid?: boolean;
  label?: string;
}

export interface InputRef {
  focus: () => void;
  blur?: () => void;
  markAsInvalid: () => void;
  markAsValid: () => void;
  isInvalid: () => boolean;
  setValue: (value: string) => void;
  getValue: () => string;
}

enum InputState {
  Unfocused = 0,
  Focused = 1,
  Invalid = 2,
}

const LABEL_SCALE_RATIO = 0.8;
const ANIM_DURATION = 100;


export const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    onChangeText,
    onLayout,
    onFocus,
    onBlur,
    disableAutoMarkValid,
    withPasteButton,
    withScanButton,
    autoFocusDelay,
    indentBottom,
    defaultValue,
    leftContent,
    placeholder,
    autoFocus,
    multiline,
    label,
    style,
    ...rest
  } = props;
  const state = useSharedValue(InputState.Unfocused);
  const [isFocused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<TextInputRef>(null);
  const colors = useTheme();

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    blur() {
      inputRef.current?.blur();
    },
    markAsInvalid() {
      if (!invalid) {
        setInvalid(true);
      }
    },
    markAsValid() {
      if (invalid) {
        setInvalid(false);
      }
    },
    isInvalid() {
      return invalid;
    },
    setValue(newValue) {
      setInputValue(newValue);
    },
    getValue() {
      return inputValue;
    },
  }));

  useEffect(() => {
    cancelAnimation(state);
    const newState = invalid
      ? InputState.Invalid
      : isFocused
      ? InputState.Focused
      : InputState.Unfocused;

    state.value = withTiming(newState, {
      duration: 150,
    });
  }, [isFocused, invalid]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, autoFocusDelay ?? 0);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      if (onChangeText) {
        onChangeText(text);
      }

      if (invalid && !disableAutoMarkValid) {
        setInvalid(false);
      }
    },
    [disableAutoMarkValid, invalid],
  );

  const handleFocus = useCallback(
    (ev: FocusEvent) => {
      setFocused(true);
      if (onFocus) {
        onFocus(ev);
      }
    },
    [onFocus, setFocused],
  );
  const handleBlur = useCallback(
    (ev: FocusEvent) => {
      setFocused(false);
      if (onBlur) {
        onBlur(ev);
      }
    },
    [onBlur, setFocused],
  );

  const hasLabel = !!label;

  const containerStaticStyle = {
    backgroundColor: colors.fieldBackground,
    borderRadius: corners.medium,
    borderColor: colors.fieldBackground,
  };

  const inputStyle = useMemo(
    () => [
      styles.input,
      hasLabel ? styles.inputWithLabel : styles.inputWithoutLabel,
      { textAlignVertical: multiline ? 'top' : 'center' } as TextStyle,
      style,
    ],
    [style, hasLabel, multiline],
  );

  const invalidBgStyle = useAnimatedStyle(() => {
    const bgAlpha = interpolate(
      state.value,
      [InputState.Focused, InputState.Invalid],
      [0, 0.08],
    );
    return { backgroundColor: `rgba(255,71,102, ${bgAlpha})` };
  });

  const focusBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      state.value,
      [InputState.Unfocused, InputState.Focused, InputState.Invalid],
      [colors.fieldBackground, colors.fieldActiveBorder, colors.fieldErrorBorder],
    ),
  }));

  const hasValue = !!inputValue;
  const shouldAnimate = hasLabel && hasValue;

  const labelAnim = useSharedValue(0);
  useEffect(() => {
    labelAnim.value = withTiming(shouldAnimate ? 1 : 0, { duration: ANIM_DURATION });
  }, [hasValue]);

  const [labelWidth, setLabelWidth] = useState(0);
  const measureLabel = useCallback((ev: LayoutChangeEvent) => {
    setLabelWidth(ev.nativeEvent.layout.width);
  }, []);

  const handlePastePress = useCallback(async () => {
    try {
      const str = await Clipboard.getString();
      setInputValue(str);
    } catch {}
  }, []);

  const handlePressClear = useCallback(() => {
    setInputValue('');
  }, []);

  const handlePressInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const labelContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          labelAnim.value,
          [0, 1],
          [0, Math.round(labelWidth * LABEL_SCALE_RATIO) / 2 - labelWidth / 2],
        ),
      },
      {
        translateY: interpolate(labelAnim.value, [0, 1], [0, -13]),
      },
      {
        scale: interpolate(labelAnim.value, [0, 1], [1, LABEL_SCALE_RATIO]),
      },
    ],
  }));

  const labelShiftStyle = useAnimatedStyle(() => ({
    height: interpolate(labelAnim.value, [0, 1], [0, 8]),
  }));

  const inputHeightCompensatorStyle = useAnimatedStyle(() => ({
    marginBottom: interpolate(labelAnim.value, [0, 1], [0, -8]),
  }));

  return (
    <TouchableWithoutFeedback onPress={handlePressInput}>
      <Animated.View
        onLayout={onLayout}
        style={[
          indentBottom && styles.indentBottom.static,
          styles.container.static,
          containerStaticStyle,
          focusBorderStyle,
        ]}
      >
        <Animated.View style={[styles.invalidBg.static, invalidBgStyle]} />
        {!!leftContent && <View style={styles.leftContent}>{leftContent}</View>}
        <View style={styles.labelContainer}>
          <Animated.View onLayout={measureLabel} style={labelContainerStyle}>
            <Text type="body1" color="textSecondary">
              {label}
            </Text>
          </Animated.View>
        </View>
        <View style={styles.inputContainer}>
          <Animated.View style={labelShiftStyle} />
          <TextInput
            {...rest}
            selectionColor={invalid ? colors.accentRed : colors.accentBlue}
            placeholder={!hasLabel ? placeholder : undefined}
            placeholderTextColor={colors.textSecondary}
            onChangeText={handleChangeText}
            keyboardAppearance="dark"
            allowFontScaling={false}
            scrollEnabled={false}
            multiline={multiline}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disableFullscreenUI
            style={inputStyle}
            value={inputValue}
            ref={inputRef}
          />
          <Animated.View style={inputHeightCompensatorStyle} />
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

export const InputBorderWidth = 1.5;

const inputPaddings = {
  withLabel: {
    android: {
      paddingTop: 18,
      paddingBottom: 18.5,
    },
    other: {
      paddingTop: 20.5,
      paddingBottom: 20,
    },
  },
  withoutLabel: {
    android: {
      paddingTop: 14,
      paddingBottom: 14.5,
    },
    other: {
      paddingTop: 16.5,
      paddingBottom: 16,
    },
  },
};

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    backgroundColor: colors.fieldBackground,
    borderRadius: corners.medium,
    borderWidth: InputBorderWidth,
    flexDirection: 'row',
    position: 'relative',
  },
  indentBottom: {
    marginBottom: 16,
  },
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    fontSize: 16,
    // lineHeight: 24,
    fontFamily: Font.Regular,
    color: colors.textPrimary,
    paddingHorizontal: 16 - InputBorderWidth,
    paddingVertical: 0,
    flexGrow: 1,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  inputWithLabel: isAndroid
    ? inputPaddings.withLabel.android
    : inputPaddings.withLabel.other,
  inputWithoutLabel: isAndroid
    ? inputPaddings.withoutLabel.android
    : inputPaddings.withoutLabel.other,
  leftContent: {
    paddingTop: 16 - InputBorderWidth,
    position: 'absolute',
    top: 0,
  },
  invalidBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    height: 63 - InputBorderWidth,
    paddingHorizontal: 16 - InputBorderWidth,
  },
}));
