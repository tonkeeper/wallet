import React from 'react';
import { FeatureButtonProps } from './FeatureButton.interface';
import * as S from './FeatureButton.style';
import { Icon } from '$uikit';
import { Text } from '@tonkeeper/uikit';

export const FeatureButton: React.FC<FeatureButtonProps> = (props) => {
  const { title, iconName, color, highlightColor, onPress } = props;

  return (
    <S.Wrap>
      <S.Touchable highlightColor={highlightColor} color={color} onPress={onPress}>
        <S.InnerContainer withIcon={!!iconName}>
          <S.IconContainer>
            {iconName ? <Icon name={iconName} color="buttonPrimaryForeground" /> : null}
          </S.IconContainer>
          <Text type="label2" color="buttonPrimaryForeground">
            {title}
          </Text>
        </S.InnerContainer>
      </S.Touchable>
    </S.Wrap>
  );
};
