import React from 'react';
import * as S from './Properties.style';
import { PropertiesProps } from '$core/NFT/Properties/Properties.interface';
import { t } from '@tonkeeper/shared/i18n';
import Animated from 'react-native-reanimated';
import { ns } from '$utils';
import {Text} from "$uikit";

export const Properties: React.FC<PropertiesProps> = ({ properties }) => {
  

  function renderPropertyItem(item) {
    return (
      <S.ItemContainer>
        <S.Background />
        <S.ContentWrap>
          <Text color="foregroundSecondary" variant="body1">
            {item.trait_type}
          </Text>
          <Text variant="body1">{item.value}</Text>
        </S.ContentWrap>
      </S.ItemContainer>
    );
  }

  if (!properties?.length) {
    return null;
  }

  return (
    <S.Container>
      <S.TitleWrapper>
        <Text variant="h3">{t('nft_properties')}</Text>
      </S.TitleWrapper>
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: ns(-16) }}
        contentContainerStyle={{ paddingLeft: ns(16) }}
        keyExtractor={(item) => `property_${item.trait_type}`}
        horizontal
        data={properties}
        renderItem={({ item }) => renderPropertyItem(item)}
      />
    </S.Container>
  );
};
