import React, { FC, useCallback } from 'react';

import { ExchangeItemProps } from './ExchangeItem.interface';
import * as S from './ExchangeItem.style';
import { useExchangeMethodInfo } from '$hooks/useExchangeMethodInfo';
import { useTheme } from '$hooks/useTheme';
import { Icon, Text } from '$uikit';
import { Linking } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import { openExchangeMethodModal } from '$core/ModalContainer/ExchangeMethod/ExchangeMethod';
import { getCryptoAssetIconSource } from '@tonkeeper/uikit/assets/cryptoAssets';
import { Pressable, Steezy } from '@tonkeeper/uikit';

export const ExchangeItem: FC<ExchangeItemProps> = ({
  methodId,
  topRadius,
  bottomRadius,
}) => {
  const method = useExchangeMethodInfo(methodId);
  const theme = useTheme();

  const isBot = methodId.endsWith('_bot');

  const handlePress = useCallback(() => {
    if (!method) {
      return null;
    }
    if (isBot) {
      openExchangeMethodModal(methodId, () => {
        Linking.openURL(method.action_button.url);
      });
    } else {
      openExchangeMethodModal(methodId);
    }
  }, [isBot, method, methodId]);

  function renderBadge() {
    if (!method) {
      return null;
    }
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
      <Pressable
        underlayColor={theme.colors.backgroundTertiary}
        style={[
          styles.cardPressable,
          topRadius && styles.topBorderRadius,
          bottomRadius && styles.bottomBorderRadius,
        ]}
        onPress={handlePress}
        disabled={!!method.disabled}
      >
        <S.CardIn>
          <S.Icon source={{ uri: method.icon_url }} />
          <S.Contain>
            <S.LabelContainer>
              <Text variant="label1">{method.title}</Text>
              {isBot ? <S.LabelBadge>{t('exchange_telegram_bot')}</S.LabelBadge> : null}
            </S.LabelContainer>
            {method.assets ? (
              <S.AssetsContainer>
                {method.assets.slice(0, 3).map((asset, index) => (
                  <S.Asset key={asset} style={{ zIndex: 3 - index }}>
                    <S.AssetImage source={getCryptoAssetIconSource(asset)} />
                  </S.Asset>
                ))}
                {method.assets.length > 3 ? (
                  <S.AssetsCount>
                    <Text variant="label3" color="textSecondary">
                      + {method.assets.length}
                    </Text>
                  </S.AssetsCount>
                ) : null}
              </S.AssetsContainer>
            ) : (
              <Text
                style={{ overflow: 'hidden' }}
                color="foregroundSecondary"
                numberOfLines={5}
                ellipsizeMode="tail"
                variant="body2"
              >
                {method.subtitle}
              </Text>
            )}
          </S.Contain>
          <S.IconContain>
            <Icon name="ic-chevron-16" color="foregroundTertiary" />
          </S.IconContain>
        </S.CardIn>
      </Pressable>
      {renderBadge()}
      {!bottomRadius ? <S.Divider /> : null}
    </S.Wrap>
  );
};

const styles = Steezy.create({
  cardPressable: {
    overflow: 'hidden',
    padding: 16,
  },
  topBorderRadius: {
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  bottomBorderRadius: {
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
  },
});
