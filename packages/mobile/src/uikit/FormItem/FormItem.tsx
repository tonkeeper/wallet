import React, { FC } from 'react';

import * as S from './FormItem.style';
import { FormItemProps } from '../FormItem/FormItem.interface';
import { Text } from '../Text/Text';

export const FormItem: FC<FormItemProps> = (props) => {
  const {
    title = null,
    description = null,
    children,
    skipHorizontalPadding = false,
    skipHorizontalContentPadding = false,
    indicator = null,
  } = props;

  return (
    <S.Wrap>
      {(title || indicator) && (
        <S.Header>
          <Text variant="label1" style={{ flex: 1 }}>
            {title}
          </Text>
          <S.Indicator>
            {typeof indicator === 'string' ? (
              <Text color="foregroundSecondary" variant="body1" style={{ flex: 1 }}>
                {indicator}
              </Text>
            ) : (
              indicator
            )}
          </S.Indicator>
        </S.Header>
      )}
      <S.Content
        skipHorizontalContentPadding={skipHorizontalContentPadding}
        skipHorizontalPadding={skipHorizontalPadding}
      >
        {children}
      </S.Content>
      {description && (
        <S.DescriptionWrapper skipHorizontalPadding={skipHorizontalPadding}>
          <Text color="foregroundSecondary" variant="body2">
            {description}
          </Text>
        </S.DescriptionWrapper>
      )}
    </S.Wrap>
  );
};
