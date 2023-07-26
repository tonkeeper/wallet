import React, { useCallback, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import {
  Icon,
  ScrollHandler,
  Text,
  PopupMenu,
  PopupMenuItem,
  IconButton,
  Skeleton,
  SwapIcon,
} from '$uikit';
import { delay, maskifyTonAddress, ns } from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJetton } from '$hooks/useJetton';
import { useTheme, useTokenPrice, useTranslator } from '$hooks';
import { openDAppBrowser, openReceive, openSend } from '$navigation';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { useSelector } from 'react-redux';
import { useJettonEvents } from '$hooks/useJettonEvents';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { RefreshControl } from 'react-native';
import { walletAddressSelector } from '$store/wallet';
import { formatter } from '$utils/formatter';
import { useNavigation } from '@tonkeeper/router';
import { useSwapStore } from '$store/zustand/swap';
import { shallow } from 'zustand/shallow';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const theme = useTheme();
  const flags = useFlags(['disable_swap']);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const jetton = useJetton(route.params.jettonAddress);
  const t = useTranslator();
  const { events, isRefreshing, isLoading, refreshJettonEvents } = useJettonEvents(
    jetton.jettonAddress,
  );
  const address = useSelector(walletAddressSelector);
  const jettonPrice = useTokenPrice(jetton.jettonAddress, jetton.balance);

  const nav = useNavigation();

  const showSwap = useSwapStore((s) => !!s.assets[jetton.jettonAddress], shallow);

  const handleSend = useCallback(() => {
    openSend(jetton.jettonAddress, undefined, undefined, undefined, true);
  }, [jetton.jettonAddress]);

  const handleReceive = useCallback(() => {
    openReceive(CryptoCurrencies.Ton, true, jetton.jettonAddress);
  }, [jetton.jettonAddress]);

  const handlePressSwap = React.useCallback(() => {
    nav.openModal('Swap', { jettonAddress: jetton.jettonAddress });
  }, [jetton.jettonAddress, nav]);

  const handleOpenExplorer = useCallback(async () => {
    await delay(200);
    openDAppBrowser(
      getServerConfig('accountExplorer').replace('%s', address.ton) +
        `/jetton/${jetton.jettonAddress}`,
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
            <HideableAmount variant="h2">
              {formatter.format(jetton.balance, {
                decimals: jetton.metadata.decimals,
                currency: jetton.metadata.symbol,
                currencySeparator: 'wide',
              })}
            </HideableAmount>
            <HideableAmount
              style={{ marginTop: 2 }}
              variant="body2"
              color="foregroundSecondary"
            >
              {jettonPrice.formatted.totalFiat || t('jetton_token')}
            </HideableAmount>
            {jettonPrice.formatted.fiat ? (
              <Text style={{ marginTop: 12 }} variant="body2" color="foregroundSecondary">
                {t('jetton_price')} {jettonPrice.formatted.fiat}
              </Text>
            ) : null}
          </S.JettonAmountWrapper>
          {jetton.metadata.image ? (
            <S.Logo source={{ uri: jetton.metadata.image }} />
          ) : null}
        </S.FlexRow>
        <S.Divider style={{ marginBottom: ns(16) }} />
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
          {showSwap && !flags.disable_swap ? (
            <IconButton
              onPress={handlePressSwap}
              icon={<SwapIcon />}
              title={t('wallet.swap_btn')}
            />
          ) : null}
        </S.ActionsContainer>
        <S.Divider style={{ marginBottom: 10 }} />
      </S.HeaderWrap>
    );
  }, [
    jetton,
    t,
    jettonPrice,
    handleSend,
    handleReceive,
    showSwap,
    flags.disable_swap,
    handlePressSwap,
  ]);

  const renderFooter = useCallback(() => {
    if (Object.values(events).length === 0 && isLoading) {
      return <Skeleton.List />;
    }
    return null;
  }, [events, isLoading]);

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
        renderFooter={renderFooter}
      />
    );
  }, [
    renderFooter,
    refreshJettonEvents,
    isRefreshing,
    events,
    renderHeader,
    bottomInset,
    theme.colors.foregroundPrimary,
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
              <S.HeaderViewDetailsButton onPress={() => null}>
                <Icon name="ic-ellipsis-16" color="foregroundPrimary" />
              </S.HeaderViewDetailsButton>
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
