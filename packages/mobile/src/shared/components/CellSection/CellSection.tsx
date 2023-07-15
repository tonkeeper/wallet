import React, { FC, forwardRef, PropsWithChildren, ReactNode, useMemo } from 'react';

import * as S from './CellSection.style';
import { CellProps } from './CellSection.interface';
import { Icon, Separator, Text } from '$uikit';
import { StyleProp, ViewStyle } from 'react-native';

export interface CellSectionProps {
  sectionStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export const CellSection: FC<CellSectionProps> = ({ children, sectionStyle }) => {
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

  return <S.Section style={sectionStyle}>{items}</S.Section>;
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
      content,
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
              {content ? (
                content
              ) : (
                <Text style={{ flex: 1 }} variant="label1">
                  {children}
                </Text>
              )}
              {inlineContent}
            </S.SectionItemTitleWrap>
            {!!indicator && <S.SectionItemIndicator>{indicator}</S.SectionItemIndicator>}
            {!!icon && <Icon name={icon} color="accentPrimary" />}
          </S.SectionItemInner>
        </S.SectionItem>
      </>
    );
  },
);
