import React, { FC, forwardRef, PropsWithChildren, useMemo } from 'react';

import * as S from './CellSection.style';
import { CellProps } from './CellSection.interface';
import { useTheme } from '$hooks';
import { Icon, Separator, Text } from '$uikit';

export const CellSection: FC = ({ children }) => {
  const items = useMemo(() => {
    return React.Children.map(children, (node, i) => {
      if (!React.isValidElement(node)) {
        return node;
      }

      return React.cloneElement(node, {
        skipSeparator: i === 0,
      });
    });
  }, [children]);

  return <S.Section>{items}</S.Section>;
};

export const CellSectionItem = forwardRef<any, PropsWithChildren<CellProps>>(
  (props, ref) => {
    const {
      onPress,
      children,
      skipSeparator = false,
      icon,
      indicator,
      inlineContent,
      content
    } = props;

    return (
      <>
        {!skipSeparator && <Separator />}
        <S.SectionItem
          ref={ref}
          onPress={onPress}
          contentViewStyle={{
            flex: 1,
          }}
        >
          <S.SectionItemInner>
            <S.SectionItemTitleWrap>
              {content ? content : (
                <Text style={{ flex: 1 }} variant="label1">
                  {children}
                </Text>
              )}
              {inlineContent}
            </S.SectionItemTitleWrap>
            {!!indicator && <S.SectionItemIndicator>{indicator}</S.SectionItemIndicator>}
            {!!icon && (
              <Icon name={icon} color="accentPrimary" />
            )}
          </S.SectionItemInner>
        </S.SectionItem>
      </>
    );
  },
);
