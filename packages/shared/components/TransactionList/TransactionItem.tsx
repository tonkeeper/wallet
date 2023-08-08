import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Icon,
  List,
  ListSeparator,
  Steezy,
  Text,
  useTheme,
  View,
} from '@tonkeeper/uikit';
import { MappedEventAction } from '../../mappers/AccountEventsMapper';
import { TransactionNFTItem } from './TransactionNFTItem';
import React, { memo, useCallback, useMemo } from 'react';
import { SText } from '@tonkeeper/uikit/src/components/Text';
import FastImage from 'react-native-fast-image';
import { t } from '../../i18n';
import { useNavigation } from '@tonkeeper/router';
import { EncryptedComment, EncryptedCommentLayout } from '../EncryptedComment';
import { SenderAddress } from '../../mappers/AccountEventsMapper/AccountEventsMapper.utils';
import { openTransactionDetails } from '../../modals/TransactionModal';

interface TransactionItemProps {
  item: MappedEventAction;
}

const useBackgroundHighlighted = () => {
  const theme = useTheme();
  const isPressed = useSharedValue(0);
  const onPressIn = () => (isPressed.value = 1);
  const onPressOut = () => (isPressed.value = 0);

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
  const router = useNavigation();

  const isSimplePreview = item.type === 'SimplePreview';
  const containerStyle = useMemo(
    () => [
      item.bottomCorner && styles.bottomCorner,
      item.topCorner && styles.topCorner,
      styles.containerListItem,
    ],
    [item.bottomCorner, item.topCorner],
  );

  const handlePress = useCallback(() => {
    if (!isSimplePreview) {
      openTransactionDetails(item.id);
      // router.navigate('transaction', { transactionId: item.id });
    }
  }, [isSimplePreview, item]);

  return (
    <View style={containerStyle}>
      <List.Item
        onPressOut={onPressOut}
        onPressIn={onPressIn}
        onPress={handlePress}
        title={item.operation}
        subtitle={item.subtitle}
        value={item.amount}
        valueStyle={[
          item.isReceive && styles.receiveValue,
          item.isScam && styles.scamAmountText,
        ]}
        subvalue={
          item.amount2 ? (
            <View>
              <SText type="label1" style={styles.amount}>
                {item.amount2}
              </SText>
              <SText style={styles.timeText} type="body2" color="textSecondary">
                {item.time}
              </SText>
            </View>
          ) : (
            item.time
          )
        }
        leftContent={
          <Animated.View style={[styles.icon.static, backgroundStyle]}>
            {!!item.picture ? (
              <FastImage
                resizeMode="cover"
                source={{
                  uri: item.picture,
                }}
                style={{ width: 44, height: 44, borderRadius: 44 / 2 }}
              />
            ) : (
              <>
                {item.iconName && <Icon name={item.iconName} color="iconSecondary" />}
                {item.inProgress && (
                  <View style={styles.sending}>
                    <Icon name="ic-clock-16" colorHex="#FFF" />
                  </View>
                )}
              </>
            )}
          </Animated.View>
        }
        content={
          <View>
            {(!!item.nftAddress || !!item.nftItem) && (
              <TransactionNFTItem
                highlightStyle={backgroundStyle}
                nftAddress={item.nftAddress}
                nftItem={item.nftItem}
              />
            )}
            {!!item.comment && (
              <Animated.View style={[styles.comment.static, backgroundStyle]}>
                <Text type="body2">{item.comment}</Text>
              </Animated.View>
            )}
            {!!item.encryptedComment && (
              <EncryptedComment
                sender={item.sender as SenderAddress}
                transactionId={item.eventId}
                transactionType={item.type}
                layout={EncryptedCommentLayout.BUBBLE}
                encryptedComment={item.encryptedComment}
                backgroundStyle={backgroundStyle}
              />
            )}
            {item.isFailed && (
              <Text type="body2" color="accentOrange" style={styles.failedText.static}>
                {t('transactions.failed')}
              </Text>
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
    textAlign: 'right',
  },
  amount: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
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
  timeText: {
    textAlign: 'right',
  },
  failedText: {
    marginTop: 8,
  },
  scamAmountText: {
    color: colors.textTertiary,
  },
  sending: {
    backgroundColor: colors.iconSecondary,
    borderRadius: 16 / 2,
    height: 16,
    width: 16,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
}));
