import React, { FC, useCallback, useState } from 'react';

import * as S from './Button.style';
import { ButtonProps } from './Button.interface';
import { TouchableWithoutFeedback } from 'react-native';
import { Loader } from '@tonkeeper/uikit';

export const Button: FC<ButtonProps> = (props) => {
  const {
    style,
    titleFont,
    size = 'large',
    mode = 'primary',
    children,
    before = null,
    after = null,
    onPress,
    onPressIn,
    onPressOut,
    disabled = false,
    isLoading = false,
    inverted = false,
    withoutTextPadding = false,
    withoutFixedHeight = false,
  } = props;
  const [isPressed, setPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setPressed(true);
    onPressIn?.();
  }, [onPressIn]);

  const handlePressOut = useCallback(() => {
    setPressed(false);
    onPressOut?.();
  }, [onPressOut]);

  function renderContent() {
    if (isLoading) {
      return <Loader size="medium" color="buttonPrimaryForeground" />;
    }

    return (
      <>
        {typeof before === 'function' ? before({ isPressed }) : before}
        {!!children && (
          <S.Title
            isPressed={isPressed}
            font={titleFont}
            withoutTextPadding={withoutTextPadding}
            mode={mode}
            disabled={disabled}
            size={size}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {children}
          </S.Title>
        )}
        {typeof after === 'function' ? after({ isPressed }) : after}
      </>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
    >
      <S.Button
        withoutFixedHeight={withoutFixedHeight}
        size={size}
        mode={mode}
        style={style}
        inverted={inverted}
        isPressed={isPressed}
        disabled={disabled}
      >
        {renderContent()}
      </S.Button>
    </TouchableWithoutFeedback>
  );
};
