import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  interpolateColor,
  cancelAnimation,
  withTiming,
} from 'react-native-reanimated';

import { css } from '$styled';
import { useTheme } from '$hooks';
import { InputProps } from './Input.interface';
import * as S from './Input.style';
import { isIOS, ns } from '$utils';
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';

const FocusedInputBorderWidth = ns(1.5);

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
    value,

    onContentSizeChange,

    component,
    innerRef,
    ...otherProps
  } = props;

  const { isDark, colors } = useTheme();
  const [isFocused, setFocused] = useState(false);
  const focusAnimation = useSharedValue(0);
  const failAnimation = useSharedValue(0);

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
        [colors.backgroundSecondary, colors.accentPrimary],
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
        [colors.backgroundSecondary, colors.accentNegative],
      ),
      backgroundColor: `rgba(255,71,102, ${bgAlpha})`,
    };
  });

  return (
    <S.InputWrapper {...{ wrapperStyle, isFailed }}>
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
      <S.Input
        {...otherProps}
        {...{ inputStyle, multiline, editable, keyboardType, blurOnSubmit, autoFocus }}
        ref={innerRef}
        allowFontScaling={false}
        selectionColor={isFailed ? colors.accentNegative : colors.accentPrimary}
        keyboardAppearance={isDark ? 'dark' : 'light'}
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
      {onContentSizeChange ? (
        <S.GhostTextContainer pointerEvents="none">
          <S.InputText onLayout={handleTextLayout}>{value}</S.InputText>
        </S.GhostTextContainer>
      ) : null}
    </S.InputWrapper>
  );
};
