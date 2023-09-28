import React, { FC, useCallback } from 'react';

import { ExchangeItemProps } from './ExchangeItem.interface';
import * as S from './ExchangeItem.style';
import { useExchangeMethodInfo } from '$hooks/useExchangeMethodInfo';
import { useTheme } from '$hooks/useTheme';
import { Icon, Text } from '$uikit';
import { Linking } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import { openExchangeMethodModal } from '$core/ModalContainer/ExchangeMethod/ExchangeMethod';

export const ExchangeItem: FC<ExchangeItemProps> = ({
  methodId,
  topRadius,
  bottomRadius,
}) => {
  const method = useExchangeMethodInfo(methodId);
  const theme = useTheme();

  const isBot = methodId.endsWith('_bot');

  const handlePress = useCallback(() => {
    if (!method) return null;
    if (isBot) {
      openExchangeMethodModal(methodId, () => {
        Linking.openURL(method.action_button.url);
      });
    } else {
      openExchangeMethodModal(methodId);
    }
  }, [isBot, method, methodId]);

  function renderBadge() {
    if (!method) return null;
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

  if (!method || method.disabled) {
    return null;
  }

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
            <S.LabelContainer>
              <Text variant="label1">{method.title}</Text>
              {isBot ? <S.LabelBadge>{t('exchange_telegram_bot')}</S.LabelBadge> : null}
            </S.LabelContainer>
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
            <Icon name="ic-chevron-16" color="foregroundSecondary" />
          </S.IconContain>
        </S.CardIn>
      </S.Card>
      {renderBadge()}
      {!bottomRadius ? <S.Divider /> : null}
    </S.Wrap>
  );
};
