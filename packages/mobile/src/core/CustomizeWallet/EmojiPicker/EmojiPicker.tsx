import { changeAlphaValue, convertHexToRGBA, isAndroid } from '$utils';
import { FlashList } from '@shopify/flash-list';
import { Steezy, View, WalletIcon, ns, useTheme } from '@tonkeeper/uikit';
import { WALLET_ICONS } from '@tonkeeper/uikit/src/utils/walletIcons';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Emoji {
  emoji: string;
  name: string;
}

const emojis: Emoji[] = require('./emojis.json');

const items: Emoji[] = [
  ...WALLET_ICONS.map((value) => ({ emoji: value, name: value })),
  ...emojis,
];

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = memo(({ onChange }) => {
  const renderEmoji = useCallback(
    ({ item }: { item: Emoji }) => {
      return (
        <TouchableOpacity activeOpacity={0.5} onPress={() => onChange(item.emoji)}>
          <View style={styles.emojiContainer}>
            <WalletIcon emojiStyle={styles.emoji.static} size={32} value={item.emoji} />
          </View>
        </TouchableOpacity>
      );
    },
    [onChange],
  );

  const theme = useTheme();

  const rgbaColor = convertHexToRGBA(theme.backgroundPageAlternate);

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        numColumns={7}
        keyExtractor={(item) => item.name}
        renderItem={renderEmoji}
        contentContainerStyle={styles.flatListContent.static}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ns(48)}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[theme.backgroundPageAlternate, changeAlphaValue(rgbaColor, 0)]}
        style={styles.topGradient.static}
      />
      <View style={styles.bottomCover} pointerEvents="none" />
      <LinearGradient
        pointerEvents="none"
        colors={[changeAlphaValue(rgbaColor, 0), theme.backgroundPageAlternate]}
        style={styles.bottomGradient.static}
      />
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flex: 1,
    position: 'relative',
  },
  flatListContent: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 27,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: isAndroid ? 30 : 36,
    marginLeft: isAndroid ? -4 : 0,
  },
  topGradient: {
    height: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    height: 48,
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  bottomCover: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.backgroundPageAlternate,
  },
}));
