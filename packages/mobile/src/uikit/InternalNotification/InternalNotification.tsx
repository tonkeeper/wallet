import React, { FC, useCallback } from 'react';
import { LayoutAnimation, View } from 'react-native';

import { InternalNotificationProps } from './InternalNotification.interface';
import * as S from './InternalNotification.style';
import { useTheme } from '$hooks/useTheme';
import { Text } from '../Text/Text';
import { Icon } from '../Icon/Icon';
import { ns, triggerSelection } from '$utils';
import { TonThemeColor } from '$styled';

export const InternalNotification: FC<InternalNotificationProps> = (props) => {
  const { title, caption, action, mode, onPress, onClose } = props;

  const theme = useTheme();

  let textColor: any = 'foregroundPrimary';
  let captionColor: TonThemeColor = 'foregroundPrimary';
  let highlightColor: TonThemeColor = 'accentOrangeActive';
  let bgColor = theme.colors.accentNegative;
  let captionOpacity = 1;

  if (mode === 'warning') {
    textColor = 'backgroundPrimary';
    captionColor = 'backgroundPrimary';
    bgColor = '#F5A73B';
    captionOpacity = 0.76;
  } else if (mode === 'tertiary') {
    textColor = 'foregroundPrimary';
    captionColor = 'textSecondary';
    bgColor = '#2E3847';
    highlightColor = 'backgroundQuaternary';
  } else if (mode === 'neutral') {
    textColor = 'foregroundPrimary';
    bgColor = theme.colors.accentPrimary;
    highlightColor = 'accentPrimaryLight';
    captionOpacity = 0.76;
  } else if (mode === 'positive') {
    textColor = 'backgroundPrimary';
    captionColor = 'backgroundPrimary';
    bgColor = theme.colors.accentPositive;
  }

  const handleClose = useCallback(() => {
    triggerSelection();
    LayoutAnimation.easeInEaseOut();
    onClose && onClose();
  }, [onClose]);

  return (
    <S.AnimWrap>
      <S.Clickable
        onPress={onPress}
        isDisabled={!onPress}
        background={highlightColor}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <S.Wrap>
          {!!onClose && (
            <S.CloseButton onPress={handleClose}>
              <Icon name="ic-close-16" color={textColor} />
            </S.CloseButton>
          )}
          <Text
            style={{ marginBottom: ns(4) }}
            color={textColor}
            variant="label1"
            lineHeight={24}
          >
            {title}
          </Text>
          <Text
            style={{ marginBottom: ns(4), opacity: captionOpacity }}
            color={captionColor}
            variant="body2"
            lineHeight={20}
          >
            {caption}
          </Text>
          {!!action && (
            <S.Action>
              <Text
                color={textColor}
                style={{ marginRight: ns(4) }}
                variant="label2"
                lineHeight={20}
              >
                {action}
              </Text>
              <View style={{ position: 'relative', top: 2 }}>
                <Icon name="ic-chevron-right-12" color={textColor} />
              </View>
            </S.Action>
          )}
        </S.Wrap>
      </S.Clickable>
    </S.AnimWrap>
  );
};
