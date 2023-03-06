import { Icon, Separator } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import { ImageRequireSource } from 'react-native';
import { Source } from 'react-native-fast-image';
import * as S from './StakingListCell.style';

interface Props {
  id: string;
  name: string;
  description?: string;
  iconSource?: Source | ImageRequireSource;
  separator?: boolean;
  onPress?: (id: string) => void;
}

const StakingListCellComponent: FC<Props> = (props) => {
  const { name, description, iconSource, separator, id, onPress } = props;

  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <>
      <S.CellContainer>
        <S.Cell background="backgroundTertiary" onPress={handlePress}>
          <S.Container>
            {iconSource ? (
              <S.IconContainer>
                <S.Icon source={iconSource} />
              </S.IconContainer>
            ) : null}
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
      {separator ? <Separator /> : null}
    </>
  );
};

export const StakingListCell = memo(StakingListCellComponent);
