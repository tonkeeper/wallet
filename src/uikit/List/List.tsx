import React, { FC, isValidElement, useMemo } from 'react';

import * as S from './List.style';
import { ListCellProps, ListProps } from './List.interface';
import { Separator } from '$uikit';

export const ListCell: FC<ListCellProps> = ({
  label,
  align = 'right',
  children,
  onPress,
}) => {
  return (
    <S.Cell onPress={onPress} isDisabled={!onPress}>
      <S.CellIn>
        <S.CellLabel>{label}</S.CellLabel>
        <S.CellValue
          style={
            {
              // textAlign: align,
            }
          }
        >
          {children}
        </S.CellValue>
      </S.CellIn>
    </S.Cell>
  );
};

export const List: FC<ListProps> = ({ children, align = 'right', separator = true }) => {
  const content = useMemo(() => {
    return React.Children.map(children, (item, i) => {
      if (!isValidElement(item)) {
        return null;
      }

      return (
        <>
          {separator && i > 0 && <Separator />}
          {React.cloneElement(item, {
            align,
          })}
        </>
      );
    });
  }, [align, children, separator]);

  return <S.Wrap>{content}</S.Wrap>;
};
