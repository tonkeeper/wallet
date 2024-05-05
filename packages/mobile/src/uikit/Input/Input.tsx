import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  interpolateColor,
  cancelAnimation,
  withTiming,
} from 'react-native-reanimated';

import { css } from '$styled';
import { useTheme } from '$hooks/useTheme';
import { InputProps } from './Input.interface';
import * as S from './Input.style';
import { isIOS, ns } from '$utils';
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text } from '../Text/Text';
import Clipboard from '@react-native-community/clipboard';
import { Icon } from '../Icon/Icon';
import { TextInput } from 'react-native-gesture-handler';
import { t } from '@tonkeeper/shared/i18n';

const FocusedInputBorderWidth = ns(1.5);

const LARGE_LABEL_FONT_SIZE = ns(16);
const SMALL_LABEL_FONT_SIZE = ns(12);

const ANIM_DURATION = 100;

export const Input: FC<InputProps> = (props) => {
  const {
    inputStyle = css``,
    wrapperStyle = css``,

    editable = true,
    multiline = false,
    blurOnSubmit = false,
    keyboardType = 'default',
    autoFocus = false,
    isFailed = false,
    isSuccessful = false,
    value,
    placeholder,
    label,
    rightContent,
    withPasteButton,
    withClearButton = true,
    onChangeText,

    onContentSizeChange,

    component,
    innerRef,
    ...otherProps
  } = props;

  const { isDark, colors } = useTheme();
  const [isFocused, setFocused] = useState(false);
  const focusAnimation = useSharedValue(0);
  const failAnimation = useSharedValue(0);
  const successAnimation = useSharedValue(0);
  const ref = useRef<TextInput>(null);

  const inputRef = innerRef ?? ref;

  useEffect(() => {
    cancelAnimation(focusAnimation);
    focusAnimation.value = withTiming(isFocused ? 1 : 0, {
      duration: 150,
    });
  }, [focusAnimation, isFocused]);

  useEffect(() => {
    cancelAnimation(failAnimation);
    failAnimation.value = withTiming(isFailed ? 1 : 0, {
      duration: 150,
    });
  }, [failAnimation, isFailed]);

  useEffect(() => {
    cancelAnimation(successAnimation);
    successAnimation.value = withTiming(isFocused && isSuccessful ? 1 : 0, {
      duration: 150,
    });
  }, [successAnimation, isSuccessful, isFocused]);

  const handleFocus = useCallback(
    (e) => {
      setFocused(true);
      props.onFocus && props.onFocus(e);
    },
    [props],
  );

  const handleBlur = useCallback(
    (e) => {
      setFocused(false);
      props.onBlur && props.onBlur(e);
    },
    [props],
  );

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      if (!isIOS) {
        return;
      }

      onContentSizeChange?.(event.nativeEvent.contentSize);
    },
    [onContentSizeChange],
  );

  const handleTextLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (isIOS) {
        return;
      }

      onContentSizeChange?.(event.nativeEvent.layout);
    },
    [onContentSizeChange],
  );

  const focusBorderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        focusAnimation.value,
        [0, 1],
        [0, FocusedInputBorderWidth],
      ),
      borderColor: interpolateColor(
        focusAnimation.value,
        [0, 1],
        ['transparent', colors.accentPrimary],
      ),
    };
  });

  const failBorderStyle = useAnimatedStyle(() => {
    const bgAlpha = interpolate(failAnimation.value, [0, 1], [0, 0.08]);
    return {
      borderWidth: interpolate(failAnimation.value, [0, 1], [0, FocusedInputBorderWidth]),
      borderColor: interpolateColor(
        failAnimation.value,
        [0, 1],
        ['transparent', colors.accentNegative],
      ),
      backgroundColor: `rgba(255,71,102, ${bgAlpha})`,
    };
  });

  const successBorderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        successAnimation.value,
        [0, 1],
        [0, FocusedInputBorderWidth],
      ),
      borderColor: interpolateColor(
        successAnimation.value,
        [0, 1],
        ['transparent', colors.accentPositive],
      ),
    };
  });

  const hasLabel = !!label && label.length > 0;

  const hasValue =
    !!value &&
    (typeof value === 'object'
      ? value.props.children.some(
          (child) => typeof child === 'string' && child.length > 0,
        )
      : value.length > 0);

  const hasValueAnim = useSharedValue(hasValue);

  hasValueAnim.value = hasValue;

  const shouldAnimate = hasLabel && hasValue;

  const labelContainerStyle = useAnimatedStyle(
    () => ({
      paddingTop: withTiming(shouldAnimate ? 8 : 20, { duration: ANIM_DURATION }),
    }),
    [shouldAnimate],
  );

  const labelTextStyle = useAnimatedStyle(
    () => ({
      fontSize: withTiming(
        shouldAnimate ? SMALL_LABEL_FONT_SIZE : LARGE_LABEL_FONT_SIZE,
        {
          duration: ANIM_DURATION,
        },
      ),
      color: withTiming(
        shouldAnimate && isSuccessful
          ? colors.accentPositive
          : colors.foregroundSecondary,
        { duration: 150 },
      ),
    }),
    [shouldAnimate, isSuccessful],
  );

  const inputSpacerStyle = useAnimatedStyle(() => ({
    height: withTiming(shouldAnimate ? 8 : 0, {
      duration: ANIM_DURATION,
    }),
  }));

  const inputHeightCompensatorStyle = useAnimatedStyle(() => ({
    marginBottom: withTiming(shouldAnimate ? -8 : 0, {
      duration: ANIM_DURATION,
    }),
  }));

  const rightContentStyle = useAnimatedStyle(() => ({
    opacity: withTiming(hasValueAnim.value ? 0 : 1, { duration: 100 }),
  }));

  const clearButtonStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(isFocused && hasValueAnim.value ? 1 : 0, { duration: 100 }),
    }),
    [isFocused],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      hasValueAnim.value = text.length > 0;

      onChangeText?.(text);
    },
    [hasValueAnim, onChangeText],
  );

  const handlePastePress = useCallback(async () => {
    try {
      const str = await Clipboard.getString();

      handleChangeText(str);
    } catch {}
  }, [handleChangeText]);

  const handlePressClear = useCallback(() => {
    handleChangeText('');
  }, [handleChangeText]);

  const handlePressInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <TouchableWithoutFeedback onPress={handlePressInput}>
      <S.InputWrapper {...{ wrapperStyle, isFailed, withClearButton }}>
        <S.Border
          {...{ isFocused, isFailed }}
          pointerEvents="none"
          style={focusBorderStyle}
        />
        <S.Border
          {...{ isFocused, isFailed }}
          pointerEvents="none"
          style={[failBorderStyle, { zIndex: 2 }]}
        />
        <S.Border
          {...{ isFocused, isFailed }}
          pointerEvents="none"
          style={[successBorderStyle, { zIndex: 2 }]}
        />
        <S.LabelContainer style={labelContainerStyle}>
          <Text reanimated style={labelTextStyle} color="foregroundSecondary">
            {label}
          </Text>
        </S.LabelContainer>
        <Animated.View style={inputSpacerStyle} />
        <S.Input
          {...otherProps}
          isLarge={hasLabel}
          onChangeText={handleChangeText}
          {...{ inputStyle, multiline, editable, keyboardType, blurOnSubmit, autoFocus }}
          ref={inputRef}
          allowFontScaling={false}
          selectionColor={isFailed ? colors.accentNegative : colors.accentPrimary}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          placeholder={hasLabel ? '' : placeholder}
          placeholderTextColor={colors.foregroundSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={false}
          disableFullscreenUI
          component={component}
        >
          <S.InputText>{value}</S.InputText>
        </S.Input>
        <Animated.View style={inputHeightCompensatorStyle} />
        {onContentSizeChange ? (
          <S.GhostTextContainer pointerEvents="none">
            <S.InputText onLayout={handleTextLayout}>{value}</S.InputText>
          </S.GhostTextContainer>
        ) : null}
        <S.RightContainer
          style={rightContentStyle}
          pointerEvents={hasValue ? 'none' : 'auto'}
        >
          {withPasteButton ? (
            <S.RightButton onPress={handlePastePress}>
              <Text variant="label1" color="accentPrimary">
                {t('paste')}
              </Text>
            </S.RightButton>
          ) : null}
          {rightContent}
        </S.RightContainer>
        {withClearButton ? (
          <S.RightContainer
            style={clearButtonStyle}
            pointerEvents={hasValue && isFocused ? 'auto' : 'none'}
          >
            <S.RightButton onPress={handlePressClear}>
              <Icon name="ic-xmark-circle-16" color="iconSecondary" />
            </S.RightButton>
          </S.RightContainer>
        ) : null}
      </S.InputWrapper>
    </TouchableWithoutFeedback>
  );
};
