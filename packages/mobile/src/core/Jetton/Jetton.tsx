import React, { FC, useCallback, useLayoutEffect, useMemo } from 'react';
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
  IconButton,
} from '$uikit';
import { formatAmountAndLocalize, maskifyTonAddress, ns } from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJetton } from '$hooks/useJetton';
import { useTheme, useTranslator } from '$hooks';
import { openReceive, openSend } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useJettonEvents } from '$hooks/useJettonEvents';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { Linking, RefreshControl } from 'react-native';
import { jettonIsLoadingSelector, jettonsActions, jettonSelector } from '$store/jettons';
import { walletAddressSelector } from '$store/wallet';
import { useJettonPrice } from '$hooks/useJettonPrice';

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const theme = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const jetton = useJetton(route.params.jettonAddress);
  const t = useTranslator();
  const dispatch = useDispatch();
  const { events, isRefreshing, refreshJettonEvents } = useJettonEvents(
    jetton.jettonAddress,
  );
  const address = useSelector(walletAddressSelector);
  const { price, total } = useJettonPrice(jetton.jettonAddress, jetton.balance);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <Text variant="h2">
              {formatAmountAndLocalize(jetton.balance, jetton.metadata.decimals)}{' '}
              {jetton.metadata.symbol}
            </Text>
            {total ? (
              <Text style={{ marginTop: 2 }} variant="body2" color="foregroundSecondary">
                {total}
              </Text>
            ) : null}
            {price ? (
              <Text style={{ marginTop: 12 }} variant="body2" color="foregroundSecondary">
                {t('jetton_price')} {price}
              </Text>
            ) : null}
            <S.JettonIDWrapper>
              {!(isJettonMetaLoading ?? true) ? (
                <ShowMore
                  backgroundColor={theme.colors.backgroundPrimary}
                  maxLines={2}
                  text={jettonMeta?.description ?? ''}
                />
              ) : (
                <>
                  <Skeleton.Line height={ns(20)} width={240} />
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
          <IconButton
            onPress={handleSend}
            iconName="ic-arrow-up-28"
            title={t('wallet.send_btn')}
          />
          <IconButton
            onPress={handleReceive}
            iconName="ic-arrow-down-28"
            title={t('wallet.receive_btn')}
          />
        </S.ActionsContainer>
        <S.Divider style={{ marginBottom: 10 }} />
      </S.HeaderWrap>
    );
  }, [
    jetton,
    total,
    price,
    t,
    isJettonMetaLoading,
    theme.colors.backgroundPrimary,
    jettonMeta?.description,
    handleSend,
    handleReceive,
  ]);

  const renderContent = useCallback(() => {
    return (
      <TransactionsList
        refreshControl={
          <RefreshControl
            onRefresh={refreshJettonEvents}
            refreshing={isRefreshing}
            tintColor={theme.colors.foregroundPrimary}
          />
        }
        withoutMarginForFirstHeader
        eventsInfo={events}
        initialData={[]}
        renderHeader={renderHeader}
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom: bottomInset,
        }}
      />
    );
  }, [
    refreshJettonEvents,
    isRefreshing,
    theme.colors.foregroundPrimary,
    events,
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
                  shouldCloseMenu
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
