import React, { useCallback, useState } from 'react';
import { Text } from '$uikit';
import { useTranslator } from '$hooks';
import {TouchableOpacity, View} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import {ns} from "$utils";

export interface ShowMoreProps {
  maxLines: number;
  text: string;
}

export const ShowMore: React.FC<ShowMoreProps> = ({ maxLines, text }) => {
  const t = useTranslator();

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
          colors={['rgba(29, 38, 51, 0)', 'rgba(29,38,51,1)']}
          style={{ width: ns(24), height: ns(20) }}
        />
        <View style={{ backgroundColor: '#1D2633' }}>
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
