import React, { forwardRef, ReactElement, ReactNode, useCallback, useMemo } from 'react';
import {
  FlatListProps,
  SectionList,
  SectionListProps,
  SectionListRenderItemInfo,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  compareAddresses,
  format,
  formatAmountAndLocalize,
  formatDate,
  getLocale,
  ns,
  truncateDecimal,
} from '$utils';
import { CurrencyIcon, Icon, InlineHeader, Separator, Text } from '$uikit';
import { CryptoCurrencies, CryptoCurrency } from '$shared/constants';
import Animated from 'react-native-reanimated';
import * as S from './TransactionsList.style';
import { EventsMap } from '$store/events/interface';
import { differenceInCalendarMonths } from 'date-fns';
import { EventModel, JettonBalanceModel } from '$store/models';
import { openEditCoins, openJetton, openJettonsList } from '$navigation';
import { Address, Ton } from '$libs/Ton';
import { useApprovedNfts, useJettonBalances, useTranslator } from '$hooks';
import { walletActions, walletSelector } from '$store/wallet';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { BalanceItem } from '$core/Balances/BalanceItem/BalanceItem';
import { TokenListItem } from '$uikit/TokenListItem/TokenListItem';
import { ActionItem } from '$shared/components/ActionItem/ActionItem';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { useNftData } from '$core/ManageTokens/hooks/useNftData';
import { AccountAddress, decryptMessageComment, EncryptedComment } from '@tonkeeper/core';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { Toast, useEncryptedCommentsStore } from '$store';

const AnimatedSectionList =
  Animated.createAnimatedComponent<SectionListProps<any>>(SectionList);

export interface TransactionsListProps {
  renderHeader?: FlatListProps<any>['ListHeaderComponent'];
  renderFooter?: FlatListProps<any>['ListFooterComponent'];
  refreshControl?: ReactElement;
  eventsInfo: EventsMap;
  initialData: any[];
  onScroll?: any;
  contentContainerStyle: StyleProp<ViewStyle>;
  onEndReached?: () => void;
  otherCurrencies?: CryptoCurrencies[];
  /**
   * Skips margin. Used for new token screen
   */
  withoutMarginForFirstHeader?: boolean;
}

export const TransactionsList = forwardRef<any, TransactionsListProps>(
  (
    {
      refreshControl,
      eventsInfo,
      initialData,
      onScroll,
      renderHeader,
      renderFooter,
      contentContainerStyle,
      withoutMarginForFirstHeader,
      otherCurrencies = [],
      onEndReached = _.noop,
    },
    ref,
  ) => {
    const t = useTranslator();
    const dispatch = useDispatch();
    const { enabled } = useJettonBalances(true);

    const { wallet } = useSelector(walletSelector);
    const unlockVault = useUnlockVault();

    const saveDecryptedComment = useEncryptedCommentsStore(
      (s) => s.actions.saveDecryptedComment,
    );

    const handleManageJettons = useCallback(() => {
      openJettonsList();
    }, []);

    const handleAddCoin = useCallback(() => {
      openEditCoins();
    }, []);

    const handleMigrate = useCallback(
      (fromVersion: string) => () => {
        dispatch(
          walletActions.openMigration({
            isTransfer: true,
            fromVersion,
          }),
        );
      },
      [dispatch],
    );

    const data = useMemo(() => {
      const result: {
        isFirst?: boolean;
        title?: string;
        data: any;
        footer?: React.ReactElement;
      }[] = _.clone(initialData);
      const sectionsBeforeTxsLen = result.length;

      const eventsCopy = [...Object.values(eventsInfo)];
      eventsCopy.sort((a: EventModel, b: EventModel) => {
        const aEvent = eventsInfo[a.eventId];
        const bEvent = eventsInfo[b.eventId];

        return aEvent.timestamp > bEvent.timestamp ? -1 : 1;
      });

      let lastDate = '';
      let chunk: any = [];
      for (let event of eventsCopy) {
        const jettonTransferAction = event.actions?.find((a) => a.jettonTransfer?.jetton);
        const jettonAddress = jettonTransferAction?.jettonTransfer?.jetton?.address;

        if (
          jettonAddress &&
          !enabled.find((enabledJetton) =>
            compareAddresses(enabledJetton.jettonAddress, jettonAddress),
          )
        ) {
          continue;
        }
        const ev = eventsInfo[event.eventId];
        const ts = ev.timestamp * 1000;
        const now = new Date();

        // groups elder dates by month only
        let date;
        if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
          date = format(new Date(ts), 'd MMMM', {
            locale: getLocale(),
          });
        } else {
          date = format(new Date(ts), 'LLLL');
        }
        if (date !== lastDate) {
          if (chunk.length > 0) {
            const eventTime = eventsInfo[chunk[0].eventId].timestamp;
            result.push({
              title: formatDate(new Date(eventTime * 1000)),
              data: chunk,
            });
            chunk = [];
          }

          lastDate = date;
        }

        chunk.push(event);
      }

      if (chunk.length > 0) {
        const txTime = eventsInfo[chunk[0].eventId].timestamp;
        result.push({
          title: formatDate(new Date(txTime * 1000)),
          data: chunk,
        });
      }

      if (eventsCopy.length > 0 && result.length > 0) {
        result[sectionsBeforeTxsLen].isFirst = true;
      }

      return result;
    }, [initialData, eventsInfo, enabled]);

    const decryptComment = useCallback(
      async (
        actionKey: string,
        encryptedComment?: EncryptedComment,
        sender?: AccountAddress,
      ) => {
        if (!encryptedComment || !sender) {
          return;
        }

        try {
          const vault = await unlockVault();
          const privateKey = await vault.getTonPrivateKey();

          const comment = await decryptMessageComment(
            Buffer.from(encryptedComment.cipherText, 'hex'),
            wallet!.vault.tonPublicKey,
            privateKey,
            sender.address,
          );

          saveDecryptedComment(actionKey, comment);
        } catch {
          Toast.fail(t('decryption_error'));
        }
      },
      [saveDecryptedComment, t, unlockVault, wallet],
    );

    function renderItem({ item, index, section }: SectionListRenderItemInfo<any>) {
      const borderStart = index === 0;
      const borderEnd = section.data.length - 1 === index;
      if (typeof item === 'object') {
        if ('eventId' in item) {
          return (
            <S.EventActionsGroup withSpacing={!borderEnd}>
              {item.actions.map((action, idx, actions) => (
                <View key={`${item.eventId}_${idx}`}>
                  <ActionItem
                    borderStart={idx === 0}
                    borderEnd={actions.length === idx + 1}
                    event={item}
                    action={action}
                    decryptComment={decryptComment}
                  />
                  {actions.length !== idx + 1 ? <Separator /> : null}
                </View>
              ))}
            </S.EventActionsGroup>
          );
        } else if (item?.type === 'jetton') {
          const data: JettonBalanceModel = item.data;
          const balance = `${formatAmountAndLocalize(
            data.balance,
            data.metadata.decimals,
          )} ${data.metadata.symbol || ''}`;
          const handleOpen = () => openJetton(data.jettonAddress);
          return (
            <>
              <TokenListItem
                name={data.metadata.name}
                balance={balance}
                icon={<CurrencyIcon size={44} isJetton uri={data.metadata.image} />}
                onPress={handleOpen}
                borderStart={borderStart}
                borderEnd={borderEnd}
                separator={!borderEnd}
              />
              {borderEnd && (
                <S.ManageJettons onPress={handleManageJettons}>
                  <S.ManageJettonsWrap>
                    <Icon color="foregroundSecondary" name="ic-sliders-16" />
                    <Text
                      style={{ marginLeft: ns(6) }}
                      color="foregroundSecondary"
                      variant="label2"
                    >
                      {t('jettons_manage_tokens')}
                    </Text>
                  </S.ManageJettonsWrap>
                </S.ManageJettons>
              )}
            </>
          );
        } else if (item?.type === 'old_wallet_balance') {
          return (
            <>
              {item.index !== 0 && <S.ItemDivider />}
              <S.AddOtherCoins onPress={handleMigrate(item.data.version)}>
                <S.AddOtherCoinsIcons
                  style={{ borderRadius: ns(48) / 2, overflow: 'hidden' }}
                >
                  <Icon name="ic-ton-disabled-24" colorless />
                </S.AddOtherCoinsIcons>
                <S.OldWalletBalanceCont>
                  <S.OldWalletBalanceLabelWrapper>
                    <Text numberOfLines={1} variant="label1">
                      {t('wallet_old_balance')}{' '}
                      {truncateDecimal(Ton.fromNano(item.data.balance), 2)}
                    </Text>
                  </S.OldWalletBalanceLabelWrapper>
                  <S.OldWalletBalanceCurrencyWrapper>
                    <Text numberOfLines={1} variant="label1">
                      {' TON'}
                    </Text>
                  </S.OldWalletBalanceCurrencyWrapper>
                </S.OldWalletBalanceCont>
                <Icon color="foregroundSecondary" name="ic-chevron-16" />
              </S.AddOtherCoins>
            </>
          );
        }
      } else if (item === 'add_coin_button') {
        return (
          <S.AddOtherCoins onPress={handleAddCoin}>
            <S.AddOtherCoinsIcons>
              <S.AddOtherCoinsIcon
                currency={CryptoCurrencies.Btc}
                style={{
                  marginLeft: 0,
                  zIndex: 3,
                }}
              />
              <S.AddOtherCoinsIcon
                currency={CryptoCurrencies.Eth}
                style={{ zIndex: 2 }}
              />
              <S.AddOtherCoinsIcon
                currency={CryptoCurrencies.Usdt}
                style={{ zIndex: 1 }}
              />
            </S.AddOtherCoinsIcons>
            <S.AddOtherCoinsLabelWrapper>
              <Text variant="label1" numberOfLines={1}>
                {t(otherCurrencies.length > 0 ? 'manage_other_coins' : 'add_other_coins')}
              </Text>
            </S.AddOtherCoinsLabelWrapper>
            <Icon color="foregroundSecondary" name="ic-chevron-16" />
          </S.AddOtherCoins>
        );
      }

      return (
        <BalanceItem
          borderStart={borderStart}
          borderEnd={borderEnd}
          currency={item as CryptoCurrency}
          showActions={item === CryptoCurrencies.Ton}
        />
      );
    }

    return (
      <AnimatedSectionList
        onScroll={onScroll}
        ref={ref}
        scrollEventThrottle={16}
        refreshControl={refreshControl}
        sections={data}
        keyExtractor={(item) => {
          if (typeof item === 'object' && 'eventId' in item) {
            return item.eventId;
          } else if (typeof item === 'object' && item?.data?.jettonAddress) {
            return `jetton_${item.data.jettonAddress}`;
          } else {
            return `currency_${item}`;
          }
        }}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title, isFirst } }) => {
          if (!title) {
            return null;
          }
          return (
            <InlineHeader skipMargin={withoutMarginForFirstHeader && !!isFirst}>
              {title}
            </InlineHeader>
          );
        }}
        renderSectionFooter={({ section: { footer } }) => {
          return footer || null;
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        extraData
        onEndReachedThreshold={0.01}
        onEndReached={onEndReached}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
    );
  },
);
