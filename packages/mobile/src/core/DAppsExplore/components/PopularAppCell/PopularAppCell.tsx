import { openDAppBrowser } from '$navigation';
import { Icon } from '$uikit';
import { trackEvent } from '$utils/stats';
import React, { FC, memo, useCallback } from 'react';
import * as S from './popularAppCell.style';
import { ListSeparator, View } from '@tonkeeper/uikit';

// const moreIconSource = require('./more.png');

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
          <S.Container>
            <S.IconContainer isMore={isMore}>
              {icon ? <S.Icon source={{ uri: icon }} /> : null}
              {/* {isMore ? <S.Icon source={moreIconSource} /> : null} */}
            </S.IconContainer>
            <S.Content>
              <S.Title>{name}</S.Title>
              <S.SubTitle>{description}</S.SubTitle>
            </S.Content>
            <S.ChervonContainer>
              <Icon name="ic-chevron-right-16" />
            </S.ChervonContainer>
          </S.Container>
        </S.Cell>
      </S.CellContainer>
      {separator ? <ListSeparator /> : null}
    </>
  );
};

export const PopularAppCell = memo(PopularAppCellComponent);
