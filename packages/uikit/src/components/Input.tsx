import { WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import { TextInputRef, TextInput, TextInputProps } from './TextInput';
import Clipboard from '@react-native-community/clipboard';
import { TouchableOpacity } from './TouchableOpacity';
import { corners } from '../styles/constants';
import { Steezy, useTheme } from '../styles';
import { Font } from './Text/TextStyles';
import { isAndroid, isIOS } from '../utils';
import { Icon } from './Icon';
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
import { t } from '@tonkeeper/shared/i18n';

type FocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;

interface InputProps extends TextInputProps {
  onLayout?: (ev: LayoutChangeEvent) => void;
  onChangeText?: (text: string) => void;
  onScanPress?: () => void;
  indentBottom?: WithDefault<boolean, false>;
  disableAutoMarkValid?: boolean;
  leftContent?: React.ReactNode;
  pasteButtonTitle?: string;
  withPasteButton?: boolean;
  withClearButton?: boolean;
  withScanButton?: boolean;
  withFocusBorder?: boolean;
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
const LABEL_TRANSLATE_X_TO = -30;

export const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    onChangeText,
    onScanPress,
    onLayout,
    onFocus,
    onBlur,
    disableAutoMarkValid,
    pasteButtonTitle,
    withPasteButton,
    withClearButton,
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
    withFocusBorder = true,
    ...rest
  } = props;
  const state = useSharedValue(InputState.Unfocused);
  const [isFocused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<TextInputRef>(null);
  const hasValueAnim = useSharedValue(0);
  const colors = useTheme();

  const hasLabel = !!label;
  const hasValue = !!inputValue;
  const shouldAnimate = hasLabel && hasValue;

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

  const containerStaticStyle = {
    backgroundColor: colors.fieldBackground,
    borderRadius: corners.medium,
    borderColor: 'transparent',
  };

  const inputStyle = useMemo(
    () => [
      styles.input,
      hasLabel ? styles.inputWithLabel : styles.inputWithoutLabel,
      multiline && styles.inputMiltiline,
      withClearButton && styles.inputWithClearButton,
      style,
    ],
    [style, hasLabel, multiline, withClearButton],
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
      ['transparent', colors.fieldActiveBorder, colors.fieldErrorBorder],
    ),
  }));

  const handlePastePress = useCallback(async () => {
    try {
      const str = await Clipboard.getString();
      if (onChangeText) {
        onChangeText(str);
      }
      setInputValue(str);
    } catch {}
  }, []);

  const handlePressClear = useCallback(() => {
    if (onChangeText) {
      onChangeText('');
    }
    setInputValue('');
  }, []);

  const handlePressInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    hasValueAnim.value = withTiming(shouldAnimate ? 1 : 0, { duration: ANIM_DURATION });
  }, [hasValue]);

  const labelContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(hasValueAnim.value, [0, 1], [0, LABEL_TRANSLATE_X_TO]),
      },
      {
        translateY: interpolate(hasValueAnim.value, [0, 1], [0, -13]),
      },
      {
        scale: interpolate(hasValueAnim.value, [0, 1], [1, LABEL_SCALE_RATIO]),
      },
    ],
  }));

  const labelShiftStyle = useAnimatedStyle(() => ({
    height: interpolate(hasValueAnim.value, [0, 1], [0, 8]),
  }));

  const inputHeightCompensatorStyle = useAnimatedStyle(() => ({
    marginBottom: interpolate(hasValueAnim.value, [0, 1], [0, -8]),
  }));

  const rightContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hasValueAnim.value, [0, 1], [1, 0]),
  }));

  const clearButtonStyle = useAnimatedStyle(() => {
    const value = isFocused ? hasValueAnim.value : 0;
    return {
      opacity: interpolate(value, [0, 1], [0, 1]),
    };
  }, [isFocused]);

  return (
    <TouchableWithoutFeedback onPress={handlePressInput}>
      <Animated.View
        onLayout={onLayout}
        style={[
          indentBottom && styles.indentBottom.static,
          styles.container.static,
          containerStaticStyle,
          withFocusBorder && focusBorderStyle,
        ]}
      >
        <Animated.View style={[styles.invalidBg.static, invalidBgStyle]} />
        {!!leftContent && <View style={styles.leftContent}>{leftContent}</View>}
        <View style={styles.labelContainer}>
          <Animated.View style={labelContainerStyle}>
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
            keyboardAppearance={colors.isDark ? 'dark' : 'light'}
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
        <Animated.View
          style={[styles.rightСontent.static, rightContentStyle]}
          pointerEvents={hasValue ? 'none' : 'auto'}
        >
          {withPasteButton && (
            <TouchableOpacity style={styles.rightButton} onPress={handlePastePress}>
              <Text type="label1" color="textAccent">
                {pasteButtonTitle ?? t('paste')}
              </Text>
            </TouchableOpacity>
          )}
          {withScanButton && (
            <TouchableOpacity
              style={[styles.rightButton, styles.scanButton]}
              onPress={onScanPress}
            >
              <Icon name="ic-viewfinder-28" color="accentBlue" />
            </TouchableOpacity>
          )}
        </Animated.View>
        {withClearButton && (
          <Animated.View
            style={[styles.rightСontent.static, clearButtonStyle]}
            pointerEvents={hasValue && isFocused ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={[styles.rightButton, styles.clearButton]}
              onPress={handlePressClear}
            >
              <Icon name="ic-xmark-circle-16" color="iconSecondary" />
            </TouchableOpacity>
          </Animated.View>
        )}
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
      paddingTop: 21,
      paddingBottom: 20.5,
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
  withMultiline: {
    android: {
      paddingTop: 14,
      paddingBottom: 14.5,
    },
    other: {
      paddingTop: 16.5,
      paddingBottom: 20.5,
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
    fontFamily: Font.Regular,
    color: colors.textPrimary,
    paddingHorizontal: 16 - InputBorderWidth,
    textAlignVertical: 'center',
    paddingVertical: 0,
    flexGrow: 1,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  inputMiltiline: {
    textAlignVertical: 'top',
    lineHeight: 24,
    ...inputPaddings.withMultiline.other,
    // ...isAndroid
    //   ? inputPaddings.withLabel.android
    //   : inputPaddings.withLabel.other,
  },
  inputWithClearButton: {
    paddingRight: 52 - InputBorderWidth,
  },
  inputWithLabel: isAndroid
    ? inputPaddings.withLabel.android
    : inputPaddings.withLabel.other,
  inputWithoutLabel: isAndroid
    ? inputPaddings.withoutLabel.android
    : inputPaddings.withoutLabel.other,
  leftContent: {
    top: 0,
    left: 0,
    bottom: 0,
    position: 'absolute',
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
  rightСontent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  rightButton: {
    paddingHorizontal: 16 - InputBorderWidth,
    height: '100%',
    justifyContent: 'center',
  },
  scanButton: {
    paddingHorizontal: 14 - InputBorderWidth,
  },
  clearButton: {
    paddingHorizontal: 20 - InputBorderWidth,
  },
}));
