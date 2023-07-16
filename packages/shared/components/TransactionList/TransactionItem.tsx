import Animated, { useAnimatedStyle,useSharedValue,interpolateColor } from 'react-native-reanimated';
import { Icon, List, Steezy, View, useTheme, Text, ListSeparator } from '@tonkeeper/uikit';
import { TransactionNFTItem } from './TransactionNFTItem';
import React, { memo } from 'react';

interface TransactionItemProps {
  item: any;
}

const useBackgroundHighlighted = () => {
  const theme = useTheme();
  const isPressed = useSharedValue(0);
  const onPressIn = () => (isPressed.value = 0);
  const onPressOut = () => (isPressed.value = 1);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed.value,
      [0, 1],
      [theme.backgroundContentTint, theme.backgroundHighlighted],
    ),
  }));

  return {
    backgroundStyle,
    onPressOut,
    onPressIn,
  };
};

export const TransactionItem = memo<TransactionItemProps>(({ item }) => {
  const { onPressOut, onPressIn, backgroundStyle } = useBackgroundHighlighted();

  const containerStyle = [
    item.bottomCorner && styles.bottomCorner,
    item.topCorner && styles.topCorner,
    styles.containerListItem,
  ];

  // console.log(item.nftAddress || item.nft);

  return (
    <View style={containerStyle}>
      <List.Item
        onPressOut={onPressOut}
        onPressIn={onPressIn}
        onPress={() => {}}
        title={item.operation}
        value={item.amount}
        valueStyle={item.isReceive && styles.receiveValue}
        subvalue={item.time}
        subtitle={item.senderAccount}
        leftContent={
          <Animated.View style={[styles.icon.static, backgroundStyle]}>
            {item.iconName && <Icon name={item.iconName} color="iconSecondary" />}
          </Animated.View>
        }
        content={
          <View>
            {item.nftAddress && (
              <TransactionNFTItem
                nftAddress={item.nftAddress}
                nft={item.nft}
              />
            )}
            {item.comment && (
              <Animated.View style={[styles.comment.static, backgroundStyle]}>
                <Text type="body2">{item.comment}</Text>
              </Animated.View>
            )}
          </View>
        }
      />
      {!item.bottomCorner && <ListSeparator />}
    </View>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  icon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
  },
  receiveValue: {
    color: colors.accentGreen,
  },
  topCorner: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  bottomCorner: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
    marginBottom: 8,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
  comment: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    paddingTop: 7.5,
    paddingBottom: 8.5,
  },
}));
