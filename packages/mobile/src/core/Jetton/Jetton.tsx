import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import {
  Button,
  Icon,
  ScrollHandler,
  Text,
  PopupMenu,
  PopupMenuItem,
  Skeleton,
  ShowMore,
} from '$uikit';
import { formatAmountAndLocalize, maskifyTonAddress, ns } from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJetton } from '$hooks/useJetton';
import { useTheme, useTranslator } from '$hooks';
import { ActionButtonProps } from '$core/Balances/BalanceItem/BalanceItem.interface';
import { openReceive, openSend } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useJettonEvents } from '$hooks/useJettonEvents';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { Linking, View } from 'react-native';
import { eventsSelector, eventsActions } from '$store/events';
import { jettonIsLoadingSelector, jettonsActions, jettonSelector } from '$store/jettons';
import { walletAddressSelector } from '$store/wallet';

const ActionButton: FC<ActionButtonProps> = (props) => {
  const { children, onPress, icon, isLast } = props;

  return (
    <S.ActionWrapper isLast={isLast}>
      <S.Action>
        <S.Background borderEnd borderStart />
        <S.ActionCont withDelay={false} onPress={onPress}>
          <Icon name={icon} color="constantLight" />
        </S.ActionCont>
      </S.Action>
      <Text variant="label3" color='foregroundSecondary'>{children}</Text>
    </S.ActionWrapper>
  );
};

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const jetton = useJetton(route.params.jettonAddress);
  const t = useTranslator();
  const dispatch = useDispatch();
  const jettonEvents = useJettonEvents(jetton.jettonAddress);
  const address = useSelector(walletAddressSelector);
  const { isLoading: isEventsLoading, canLoadMore } = useSelector(eventsSelector);
  const isJettonMetaLoading = useSelector((state) =>
    // @ts-ignore
    jettonIsLoadingSelector(state, route.params.jettonAddress),
  );
  const jettonMeta = useSelector((state) =>
    // @ts-ignore
    jettonSelector(state, route.params.jettonAddress),
  );

  useLayoutEffect(() => {
    const loadJettonInfo = async () => {
      dispatch(jettonsActions.loadJettonMeta(route.params.jettonAddress));
    };
    if (!jettonMeta) {
      loadJettonInfo();
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isEventsLoading || !canLoadMore) {
      return;
    }
    dispatch(eventsActions.loadEvents({ isLoadMore: true }));
  }, [dispatch, isEventsLoading, canLoadMore]);

  useEffect(() => {
    if (!Object.values(jettonEvents).length) {
      handleLoadMore();
    }
  }, [handleLoadMore, jettonEvents]);

  const handleSend = useCallback(() => {
    openSend(jetton.jettonAddress, undefined, undefined, undefined, true);
  }, [jetton.jettonAddress]);

  const handleReceive = useCallback(() => {
    openReceive(CryptoCurrencies.Ton, true, jetton.jettonAddress);
  }, [jetton.jettonAddress]);

  const handleOpenExplorer = useCallback(() => {
    Linking.openURL(
      `https://tonapi.io/account/${address.ton}/jetton/${jetton.jettonAddress}`,
    );
  }, [address.ton, jetton.jettonAddress]);

  const renderHeader = useMemo(() => {
    if (!jetton) {
      return null;
    }
    return (
      <S.HeaderWrap>
        <S.FlexRow>
          <S.JettonAmountWrapper>
            <Text style={{ marginBottom: 12 }} variant="h2">
              {formatAmountAndLocalize(jetton.balance, jetton.metadata.decimals)}{' '}
              {jetton.metadata.symbol}
            </Text>
            <S.JettonIDWrapper>
              {!(isJettonMetaLoading ?? true) ? (
                <ShowMore backgroundColor={theme.colors.backgroundPrimary} maxLines={2} text={jettonMeta?.description} />
              ) : (
                <>
                  <Skeleton.Line style={{ marginTop: 6 }} width={240} />
                </>
              )}
            </S.JettonIDWrapper>
          </S.JettonAmountWrapper>
          {jetton.metadata.image ? (
            <S.Logo source={{ uri: jetton.metadata.image }} />
          ) : null}
        </S.FlexRow>
        <S.Divider />
        <S.ActionsContainer>
          <ActionButton onPress={handleSend} icon="ic-arrow-up-28">
            {t('wallet_send')}
          </ActionButton>
          <ActionButton isLast onPress={handleReceive} icon="ic-arrow-down-28">
            {t('wallet_receive')}
          </ActionButton>
        </S.ActionsContainer>
        <S.Divider />
      </S.HeaderWrap>
    );
  }, [
    jetton,
    isJettonMetaLoading,
    jettonMeta?.description,
    handleReceive,
    t,
    handleSend,
  ]);

  // workaround, need to paginate transactions even if content not modified
  const renderFooter = useMemo(() => {
    if (!isEventsLoading) {
      return null;
    }
    return <View style={{ height: 1, width: '100%' }} />;
  }, [isEventsLoading]);

  const renderContent = useCallback(() => {
    return (
      <TransactionsList
        onEndReached={isEventsLoading || !canLoadMore ? undefined : handleLoadMore}
        eventsInfo={jettonEvents}
        initialData={[]}
        renderFooter={renderFooter}
        renderHeader={renderHeader}
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom: bottomInset,
        }}
      />
    );
  }, [
    jettonEvents,
    isEventsLoading,
    canLoadMore,
    handleLoadMore,
    renderFooter,
    renderHeader,
    bottomInset,
  ]);

  if (!jetton) {
    return null;
  }

  return (
    <S.Wrap>
      <S.ContentWrap>
        <ScrollHandler
          navBarRight={
            <PopupMenu
              items={[
                <PopupMenuItem
                  onPress={handleOpenExplorer}
                  text={t('jetton_open_explorer')}
                  icon={<Icon name="ic-globe-16" color="accentPrimary" />}
                />,
              ]}
            >
              <Button
                onPress={() => null}
                size="navbar_icon"
                mode="secondary"
                before={<Icon name="ic-ellipsis-16" color="foregroundPrimary" />}
              />
            </PopupMenu>
          }
          titleProps={{ numberOfLines: 1 }}
          isLargeNavBar={false}
          navBarTitle={jetton.metadata?.name || maskifyTonAddress(jetton.jettonAddress)}
        >
          {renderContent()}
        </ScrollHandler>
      </S.ContentWrap>
    </S.Wrap>
  );
};
