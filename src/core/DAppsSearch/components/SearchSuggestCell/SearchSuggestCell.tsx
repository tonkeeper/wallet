import { useTranslator } from '$hooks';
import { Icon, Separator } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import * as S from './SearchSuggestCell.style';

interface Props {
  url: string;
  name?: string;
  icon?: string;
  separator: boolean;
  selected: boolean;
  onPress?: (url: string, name?: string) => void;
}

const SearchSuggestCellComponent: FC<Props> = (props) => {
  const { url, name, icon, separator, selected, onPress } = props;

  const t = useTranslator();

  const handlePress = useCallback(() => {
    onPress?.(url, name);
  }, [name, url, onPress]);

  return (
    <>
      <S.CellContainer selected={selected}>
        <S.Cell
          background={selected ? 'backgroundQuaternary' : 'backgroundTertiary'}
          onPress={handlePress}
        >
          <S.Container>
            <S.IconContainer>
              {icon ? (
                <S.Icon source={{ uri: icon }} />
              ) : (
                <Icon name="ic-link-bold-16" color="foregroundSecondary" />
              )}
            </S.IconContainer>
            <S.Content>
              <S.Title>{name || t('browser.open_link')}</S.Title>
              <S.SubTitle>{url}</S.SubTitle>
            </S.Content>
          </S.Container>
        </S.Cell>
      </S.CellContainer>
      {separator ? <Separator /> : null}
    </>
  );
};

export const SearchSuggestCell = memo(SearchSuggestCellComponent);
