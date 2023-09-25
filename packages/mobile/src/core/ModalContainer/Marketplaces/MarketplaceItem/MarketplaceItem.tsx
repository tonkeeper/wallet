import React, { FC, useCallback } from 'react';

import { MarketplaceItemProps } from './MarketplaceItem.interface';
import * as S from './MarketplaceItem.style';
import { Icon, Text } from '$uikit';
import { trackEvent } from '$utils/stats';
import { openDAppBrowser } from '$navigation';

export const MarketplaceItem: FC<MarketplaceItemProps> = ({
  marketplaceUrl,
  iconUrl,
  title,
  description,
  topRadius,
  bottomRadius,
  internalId,
}) => {
  const handlePress = useCallback(async () => {
    openDAppBrowser(marketplaceUrl);
    trackEvent('marketplace_open', { internal_id: internalId });
  }, [marketplaceUrl, internalId]);

  return (
    <S.Wrap>
      <S.Card topRadius={topRadius} bottomRadius={bottomRadius} onPress={handlePress}>
        <S.CardIn>
          <S.Icon source={{ uri: iconUrl }} />
          <S.Contain>
            <Text variant="label1">{title}</Text>
            <Text
              style={{ overflow: 'hidden' }}
              color="foregroundSecondary"
              numberOfLines={5}
              ellipsizeMode="tail"
              variant="body2"
            >
              {description}
            </Text>
          </S.Contain>
          <S.IconContain>
            <Icon name="ic-chevron-16" color="foregroundSecondary" />
          </S.IconContain>
        </S.CardIn>
      </S.Card>
      {!bottomRadius ? <S.Divider /> : null}
    </S.Wrap>
  );
};
