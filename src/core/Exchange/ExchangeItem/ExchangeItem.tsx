import React, { FC, useCallback } from 'react';

import { ExchangeItemProps } from './ExchangeItem.interface';
import * as S from './ExchangeItem.style';
import { useExchangeMethodInfo, useTheme } from '$hooks';
import { openExchangeMethodModal } from '$navigation';
import {Icon, Text} from '$uikit';

export const ExchangeItem: FC<ExchangeItemProps> = ({
  methodId,
  topRadius,
  bottomRadius,
}) => {
  const method = useExchangeMethodInfo(methodId);
  const theme = useTheme();

  const handlePress = useCallback(() => {
    openExchangeMethodModal(methodId);
  }, [methodId]);

  function renderBadge() {
    if (method.badge) {
      let backgroundColor = theme.colors.accentPrimary;
      if (method.badgeStyle === 'red') {
        backgroundColor = theme.colors.accentNegative;
      }

      return (
        <S.Badge style={{ backgroundColor }}>
          <Text variant="label3">{method.badge}</Text>
        </S.Badge>
      );
    } else {
      return null;
    }
  }

  if (method.disabled) {
    return null;
  } // TODO:

  return (
    <S.Wrap>
      <S.Card
        topRadius={topRadius}
        bottomRadius={bottomRadius}
        onPress={handlePress}
        isDisabled={!!method.disabled}
      >
        <S.CardIn>
          <S.Icon source={{ uri: method.icon_url }} />
          <S.Contain>
            <Text variant="label1">{method.title}</Text>
            <Text
              style={{ overflow: 'hidden' }}
              color="foregroundSecondary"
              numberOfLines={5}
              ellipsizeMode="tail"
              variant="body2"
            >
              {method.subtitle}
            </Text>
          </S.Contain>
          <S.IconContain>
            <Icon
              name="ic-chevron-16"
              color="foregroundSecondary"
            />
          </S.IconContain>
        </S.CardIn>
      </S.Card>
      {renderBadge()}
      {!bottomRadius ? <S.Divider /> : null}
    </S.Wrap>
  );
};
