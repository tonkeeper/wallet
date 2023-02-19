import { openDAppBrowser } from '$navigation';
import { Icon, Separator, Text } from '$uikit';
import { trackEvent } from '$utils';
import React, { FC, memo, useCallback } from 'react';
import { View } from 'react-native';
import * as S from './PopularAppCell.style';

const moreIconSource = require('./more.png');

interface Props {
  url: string;
  name: string;
  description?: string;
  icon?: string;
  isMore?: boolean;
  separator?: boolean;
}

const PopularAppCellComponent: FC<Props> = (props) => {
  const { url, name, description, icon, isMore, separator } = props;

  const handlePress = useCallback(() => {
    trackEvent('click_dapp', { url, name });

    openDAppBrowser(url);
  }, [name, url]);

  return (
    <>
      <S.CellContainer>
        <S.Cell background="backgroundTertiary" onPress={handlePress}>
          <S.IconContainer isMore={isMore}>
            {icon ? <S.Icon source={{ uri: icon }} /> : null}
            {isMore ? <S.Icon source={moreIconSource} /> : null}
          </S.IconContainer>
          <S.Content>
            <S.Title>{name}</S.Title>
            <S.SubTitle>{description}</S.SubTitle>
          </S.Content>
          <S.ChervonContainer>
            <Icon name="ic-chevron-right-16" />
          </S.ChervonContainer>
        </S.Cell>
      </S.CellContainer>
      {separator ? <Separator /> : null}
    </>
  );
};

export const PopularAppCell = memo(PopularAppCellComponent);
