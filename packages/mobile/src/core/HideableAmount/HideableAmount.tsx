import React from 'react';
import { Text } from '$uikit/Text/Text';
import { TextProps } from '$uikit/Text/Text';
import { Steezy } from '@tonkeeper/uikit';
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

  if (isHidden) {
    return (
      <Text style={[styles.stars.static, style]} {...rest}>
        {stars}
      </Text>
    );
  }

  return (
    <Text style={style} {...rest}>
      {children}
    </Text>
  );
};

export const HideableAmount = React.memo(HideableAmountComponent);

const styles = Steezy.create({
  stars: {},
});
