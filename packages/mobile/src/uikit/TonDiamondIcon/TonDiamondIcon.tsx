import {
  AccentKey,
  AccentNFTIcon,
  AppearanceAccents,
  getDiamondSizeRatio,
} from '$styled';
import React, { FC, memo } from 'react';
import { IconFromUri } from './IconFromUri';
import * as S from './TonDiamondIcon.style';

interface Props {
  id: AccentKey;
  nftIcon?: AccentNFTIcon;
  size: number;
  disabled?: boolean;
  iconAnimatedStyle?: any; //AnimatedStyleProp<ViewStyle>;
  rounded?: boolean;
}

const TonDiamondIconComponent: FC<Props> = (props) => {
  const { id, nftIcon, size, disabled, iconAnimatedStyle, rounded = true } = props;

  const accent = AppearanceAccents[id];

  const DiamondIcon = accent.icon;

  const color = accent.colors.accentPrimary;

  const uri = nftIcon?.uri;

  const diamondSize = nftIcon ? getDiamondSizeRatio(nftIcon?.size) * size : 100;

  const isDefault = accent.id === AccentKey.default;

  return (
    <S.IconContainer size={size} isDefault={isDefault} rounded={rounded}>
      {!isDefault ? <S.BlurBackground color={color} size={size} /> : null}
      <S.DiamondContainer disabled={disabled} style={[iconAnimatedStyle]}>
        {uri ? (
          <IconFromUri uri={uri} size={diamondSize} />
        ) : (
          <DiamondIcon width={diamondSize} height={diamondSize} viewBox="0 0 100 100" />
        )}
      </S.DiamondContainer>
    </S.IconContainer>
  );
};

export const TonDiamondIcon = memo(TonDiamondIconComponent);
