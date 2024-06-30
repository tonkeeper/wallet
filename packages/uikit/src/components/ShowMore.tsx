import React, { useCallback, useState } from 'react';
import { Text } from './Text';
import { TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { t } from '@tonkeeper/shared/i18n';
import { useTheme } from '../styles';
import { changeAlphaValue, convertHexToRGBA } from '@tonkeeper/mobile/src/utils';

export interface ShowMoreProps {
  maxLines: number;
  text: string;
  disabled?: boolean;
  gradientColor: string;
}

export const ShowMore: React.FC<ShowMoreProps> = ({
  maxLines,
  text,
  disabled,
  gradientColor,
}) => {
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
            changeAlphaValue(convertHexToRGBA(gradientColor), 0),
            convertHexToRGBA(gradientColor),
          ]}
          style={{ width: 24, height: 20 }}
        />
        <View style={{ backgroundColor: gradientColor, paddingLeft: 4 }}>
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.6}
            onPress={handleShowAll}
          >
            <Text type="body2" color="accentBlue">
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
        type="body2"
        color="textPrimary"
      >
        {text}
      </Text>
      {showEllipsize && !shouldShowAll && <Ellipsize />}
    </View>
  );
};
