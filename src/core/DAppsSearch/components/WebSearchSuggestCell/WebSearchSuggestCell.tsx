import { Icon, Separator } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import * as S from './WebSearchSuggestCell.style';

interface Props {
  url: string;
  name: string;
  separator: boolean;
  selected: boolean;
  onPress?: (url: string, name?: string) => void;
}

const WebSearchSuggestCellComponent: FC<Props> = (props) => {
  const { url, name, separator, selected, onPress } = props;

  const handlePress = useCallback(() => {
    onPress?.(url);
  }, [url, onPress]);

  return (
    <>
      <S.CellContainer selected={selected}>
        <S.Cell
          background={selected ? 'backgroundQuaternary' : 'backgroundTertiary'}
          onPress={handlePress}
        >
          <S.Container>
            <S.IconContainer>
              <Icon name="ic-magnifying-glass-16" color="foregroundSecondary" />
            </S.IconContainer>
            <S.Title>{name}</S.Title>
          </S.Container>
        </S.Cell>
      </S.CellContainer>
      {separator ? <Separator leftOffset={44} /> : null}
    </>
  );
};

export const WebSearchSuggestCell = memo(WebSearchSuggestCellComponent);
