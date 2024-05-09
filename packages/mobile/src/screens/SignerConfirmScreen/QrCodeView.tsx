import { View, ViewStyle, deviceWidth, ns } from '@tonkeeper/uikit';
import { FC, memo, useCallback } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-styled';
import { LayoutChangeEvent } from 'react-native';

export const QR_SIZE = deviceWidth - ns(16) * 2 - ns(24) * 2;

export const QR_WRAP_STYLE: ViewStyle = {
  width: QR_SIZE,
  height: QR_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
};

interface Props {
  data: string;
  index: number;
  currentChunkIndex: Animated.SharedValue<number>;
}

export const QrCodeView: FC<Props> = memo((props) => {
  const { data, index, currentChunkIndex } = props;

  const qrCodeScale = useSharedValue(1);

  const handleQrCodeLayout = useCallback(
    (e: LayoutChangeEvent) => {
      qrCodeScale.value = QR_SIZE / e.nativeEvent.layout.width;
    },
    [qrCodeScale],
  );

  const qrStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qrCodeScale.value }],
    opacity: index === currentChunkIndex.value ? 1 : 0,
  }));

  return (
    <View style={QR_WRAP_STYLE}>
      <Animated.View style={qrStyle}>
        <QRCode data={data} onLayout={handleQrCodeLayout} pieceSize={8} />
      </Animated.View>
    </View>
  );
});
