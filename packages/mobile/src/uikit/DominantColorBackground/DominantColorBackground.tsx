import React, { memo } from 'react';
import { getColors, ImageColorsResult } from 'react-native-image-colors';
import { View } from '@tonkeeper/uikit';
import { StyleProp, ViewStyle } from 'react-native';
import { DARK_COLORS } from '$styled';

export interface DominantColorProps {
  uri?: string;
  style?: StyleProp<ViewStyle>;
}

const DominantColorBackgroundComponent: React.FC<DominantColorProps> = ({
  uri,
  style,
}) => {
  const [colors, setColors] = React.useState<ImageColorsResult | null>(null);

  React.useEffect(() => {
    if (!uri) {
      return;
    }

    getColors(uri, {
      fallback: '#ffffff',
      cache: true,
      key: uri,
    }).then(setColors);
  }, [uri]);
  return (
    <View
      style={[
        style,
        { backgroundColor: colors?.dominant ?? DARK_COLORS.backgroundSecondary },
      ]}
    />
  );
};

export const DominantColorBackground = memo(DominantColorBackgroundComponent);
