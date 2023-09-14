import Animated from 'react-native-reanimated';
import { Icon, List, ListSeparator, Loader, Steezy, Text, View } from '@tonkeeper/uikit';
import { MappedEventAction } from '../../mappers/AccountEventsMapper';
import { TransactionNFTItem } from './TransactionNFTItem';
import React, { memo, useCallback, useMemo } from 'react';
import { SText } from '@tonkeeper/uikit/src/components/Text';
import FastImage from 'react-native-fast-image';
import { t } from '../../i18n';
import { EncryptedComment, EncryptedCommentLayout } from '../EncryptedComment';
import { SenderAddress } from '../../mappers/AccountEventsMapper/AccountEventsMapper.utils';
import { openActionDetails } from '../../modals/ActionDetailsModal';
import { useSubscription } from '../../query/hooks/useSubscription';
import { CustomActionType } from '@tonkeeper/core/src/TonAPI';
import { openSubscription } from '@tonkeeper/mobile/src/core/ModalContainer/CreateSubscription/CreateSubscription';
import { useBackgroundHighlighted } from '../../hooks/useBackgroundHighlighted';

interface TransactionItemProps {
  item: MappedEventAction;
}

export const TransactionItem = memo<TransactionItemProps>(({ item }) => {
  const { onPressOut, onPressIn, backgroundStyle } = useBackgroundHighlighted();
  const subscription = useSubscription(item.subscriptionAddress);

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
    if (isSimplePreview || item.type === CustomActionType.Unknown) {
      return;
    }

    if (
      subscription &&
      (item.type === CustomActionType.Subscribe ||
        item.type === CustomActionType.UnSubscribe)
    ) {
      openSubscription(subscription);
      return;
    }

    openActionDetails(item.id);
  }, [isSimplePreview, item]);

  return (
    <View style={containerStyle}>
      <List.Item
        onPressOut={onPressOut}
        onPressIn={onPressIn}
        onPress={handlePress}
        title={item.operation}
        subtitle={
          item.subscriptionAddress ? (
            <SubscriptionMerchantName address={item.subscriptionAddress} />
          ) : (
            item.subtitle
          )
        }
        value={item.amount}
        subtitleNumberOfLines={
          item.type === 'SimplePreview' || item.type === 'Unknown' ? 2 : 1
        }
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
                  <View style={styles.sendingOuter}>
                    <View style={styles.sendingInner}>
                      <Loader size="xsmall" color="constantWhite" />
                    </View>
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

const SubscriptionMerchantName = ({ address }: { address: string }) => {
  const subscription = useSubscription(address);

  if (!subscription) {
    return null;
  }

  return (
    <Text numberOfLines={2} color="textSecondary" type="body2">
      {subscription.merchantName}
    </Text>
  );
};

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
  sendingOuter: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 18 + 2 / 2,

    borderWidth: 2,
    borderColor: colors.backgroundContent,
  },
  sendingInner: {
    borderRadius: 18 / 2,
    height: 18,
    width: 18,
    backgroundColor: colors.iconTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
