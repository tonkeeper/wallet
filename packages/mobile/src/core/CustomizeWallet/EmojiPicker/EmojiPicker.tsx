import { isAndroid } from '$utils';
import { FlashList } from '@shopify/flash-list';
import { Steezy, View, ns } from '@tonkeeper/uikit';
import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Emoji {
  emoji: string;
  name: string;
}

const emojis: Emoji[] = require('./emojis.json');

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = memo(({ onChange }) => {
  const renderEmoji = useCallback(
    ({ item }: { item: Emoji }) => {
      return (
        <TouchableOpacity activeOpacity={0.5} onPress={() => onChange(item.emoji)}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji.static}>{item.emoji}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={emojis}
        numColumns={7}
        keyExtractor={(item) => item.name}
        renderItem={renderEmoji}
        contentContainerStyle={styles.flatListContent.static}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ns(48)}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          '#10161F',
          'rgba(16, 22, 31, 0.991353)',
          'rgba(16, 22, 31, 0.96449)',
          'rgba(16, 22, 31, 0.91834)',
          'rgba(16, 22, 31, 0.852589)',
          'rgba(16, 22, 31, 0.768225)',
          'rgba(16, 22, 31, 0.668116)',
          'rgba(16, 22, 31, 0.557309)',
          'rgba(16, 22, 31, 0.442691)',
          'rgba(16, 22, 31, 0.331884)',
          'rgba(16, 22, 31, 0.231775)',
          'rgba(16, 22, 31, 0.147411)',
          'rgba(16, 22, 31, 0.0816599)',
          'rgba(16, 22, 31, 0.03551)',
          'rgba(16, 22, 31, 0.0086472)',
          'rgba(16, 22, 31, 0)',
        ]}
        style={styles.topGradient.static}
      />
      <View style={styles.bottomCover} pointerEvents="none" />
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(16, 22, 31, 0)',
          'rgba(16, 22, 31, 0.0086472)',
          'rgba(16, 22, 31, 0.03551)',
          'rgba(16, 22, 31, 0.0816599)',
          'rgba(16, 22, 31, 0.147411)',
          'rgba(16, 22, 31, 0.231775)',
          'rgba(16, 22, 31, 0.331884)',
          'rgba(16, 22, 31, 0.442691)',
          'rgba(16, 22, 31, 0.557309)',
          'rgba(16, 22, 31, 0.668116)',
          'rgba(16, 22, 31, 0.768225)',
          'rgba(16, 22, 31, 0.852589)',
          'rgba(16, 22, 31, 0.91834)',
          'rgba(16, 22, 31, 0.96449)',
          'rgba(16, 22, 31, 0.991353)',
          '#10161F',
        ]}
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
    backgroundColor: colors.backgroundPage,
  },
}));
