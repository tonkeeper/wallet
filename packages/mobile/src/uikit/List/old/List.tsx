import React, { FC, isValidElement, useMemo } from 'react';

import * as S from './List.style';
import { ListCellProps, ListProps } from './List.interface';
import { Separator } from '../../Separator/Separator';
import { View } from '../../StyledNativeComponents';
import { useTheme } from '@tonkeeper/uikit';

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

/**
 * @deprecated
 * @description
 *  Use new List instead
 */
export const List: FC<ListProps> = ({
  children,
  align = 'right',
  separator = true,
  ...viewProps
}) => {
  const content = useMemo(() => {
    return React.Children.map(children, (item, i) => {
      if (!isValidElement(item)) {
        return null;
      }

      return (
        <View key={i}>
          {separator && i > 0 && <Separator />}
          {React.cloneElement(item, {
            align,
          })}
        </View>
      );
    });
  }, [align, children, separator]);

  const theme = useTheme();

  return (
    <S.Wrap style={{ backgroundColor: theme.backgroundContent }} {...viewProps}>
      {content}
    </S.Wrap>
  );
};
