import React from 'react';
import { Text, TextProps } from '@tonkeeper/uikit';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';

export enum AnimationDirection {
  Left = -1,
  Right = 1,
  None = 0,
}

const HideableAmountComponent: React.FC<
  TextProps & { stars?: string; animationDirection?: AnimationDirection }
> = ({ children, style, stars = '* * *', ...rest }) => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);

  return (
    <Text style={style} {...rest}>
      {isHidden ? stars : children}
    </Text>
  );
};

export const HideableAmount = React.memo(HideableAmountComponent);
