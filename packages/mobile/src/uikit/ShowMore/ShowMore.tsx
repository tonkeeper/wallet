import React, { useCallback, useState } from 'react';
import { Text } from '../Text/Text';
import { TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { changeAlphaValue, convertHexToRGBA, ns } from '$utils';
import { t } from '@tonkeeper/shared/i18n';
import { useTheme } from '$hooks/useTheme';

export interface ShowMoreProps {
  maxLines: number;
  text: string;
}

export const ShowMore: React.FC<ShowMoreProps> = ({ maxLines, text }) => {
  const [showEllipsize, setShowEllipsize] = useState(false);
  const onTextLayout = useCallback(
    (e) => {
      if (showEllipsize) {
        return;
      }
      setShowEllipsize(e.nativeEvent.lines.length > maxLines);
    },
    [showEllipsize],
  );
  const [shouldShowAll, setShouldShowAll] = useState(false);

  const handleShowAll = useCallback(() => setShouldShowAll(true), [setShouldShowAll]);

  const theme = useTheme();

  function Ellipsize() {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 1000,
          flexDirection: 'row',
        }}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[
            changeAlphaValue(convertHexToRGBA(theme.colors.backgroundSecondary), 0),
            convertHexToRGBA(theme.colors.backgroundSecondary),
          ]}
          style={{ width: ns(24), height: ns(20) }}
        />
        <View style={{ backgroundColor: theme.colors.backgroundSecondary }}>
          <TouchableOpacity activeOpacity={0.6} onPress={handleShowAll}>
            <Text variant="body2" color="accentPrimary">
              {t('nft_more')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text
        onTextLayout={onTextLayout}
        numberOfLines={!showEllipsize || shouldShowAll ? undefined : maxLines}
        variant="body2"
        color="foregroundSecondary"
      >
        {text}
      </Text>
      {showEllipsize && !shouldShowAll && <Ellipsize />}
    </View>
  );
};
