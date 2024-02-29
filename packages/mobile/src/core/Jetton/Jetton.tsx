import React, { useCallback, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import { IconButton, PopupMenu, PopupMenuItem, Skeleton, SwapIcon, Text } from '$uikit';
import { ns } from '$utils';
import { useJetton } from '$hooks/useJetton';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { openDAppBrowser, openSend } from '$navigation';

import { formatter } from '$utils/formatter';
import { useNavigation } from '@tonkeeper/router';
import { useSwapStore } from '$store/zustand/swap';
import { shallow } from 'zustand/shallow';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Events, JettonVerification, SendAnalyticsFrom } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';
import { Address } from '@tonkeeper/core';
import { Icon, Screen, Spacer, Steezy, TouchableOpacity, View } from '@tonkeeper/uikit';

import { useJettonActivityList } from '@tonkeeper/shared/query/hooks/useJettonActivityList';
import { ActivityList } from '@tonkeeper/shared/components';
import { openReceiveJettonModal } from '@tonkeeper/shared/modals/ReceiveJettonModal';
import { TokenType } from '$core/Send/Send.interface';
import { config } from '$config';
import { openUnverifiedTokenDetailsModal } from '@tonkeeper/shared/modals/UnverifiedTokenDetailsModal';
import { useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { Chart } from '$shared/components/Chart/new/Chart';
import { ChartPeriod } from '$store/zustand/chart';

const unverifiedTokenHitSlop = { top: 4, left: 4, bottom: 4, right: 4 };

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const flags = useFlags(['disable_swap']);
  const jetton = useJetton(route.params.jettonAddress);
  const jettonActivityList = useJettonActivityList(jetton.jettonAddress);
  const jettonPrice = useTokenPrice(jetton.jettonAddress, jetton.balance);
  const wallet = useWallet();

  const isWatchOnly = wallet && wallet.isWatchOnly;
  const fiatCurrency = useWalletCurrency();
  const shouldShowChart = jettonPrice.fiat !== 0;
  const shouldExcludeChartPeriods = config.get('exclude_jetton_chart_periods');

  const nav = useNavigation();

  const showSwap = useSwapStore((s) => !!s.assets[jetton.jettonAddress], shallow);

  const handleSend = useCallback(() => {
    trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.TokenScreen });
    openSend({
      currency: jetton.jettonAddress,
      tokenType: TokenType.Jetton,
      from: SendAnalyticsFrom.TokenScreen,
    });
  }, [jetton.jettonAddress]);

  const handleReceive = useCallback(() => {
    openReceiveJettonModal(jetton.jettonAddress);
  }, [jetton.jettonAddress]);

  const handlePressSwap = React.useCallback(() => {
    nav.openModal('Swap', { jettonAddress: jetton.jettonAddress });
  }, [jetton.jettonAddress, nav]);

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      config
        .get('accountExplorer', tk.wallet.isTestnet)
        .replace('%s', wallet.address.ton.friendly) + `/jetton/${jetton.jettonAddress}`,
    );
  }, [jetton.jettonAddress, wallet]);

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
              {jettonPrice.formatted.totalFiat}
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
          {!isWatchOnly ? (
            <IconButton
              onPress={handleSend}
              iconName="ic-arrow-up-28"
              title={t('wallet.send_btn')}
            />
          ) : null}
          <IconButton
            onPress={handleReceive}
            iconName="ic-arrow-down-28"
            title={t('wallet.receive_btn')}
          />
          {!isWatchOnly && showSwap && !flags.disable_swap ? (
            <IconButton
              onPress={handlePressSwap}
              icon={<SwapIcon />}
              title={t('wallet.swap_btn')}
            />
          ) : null}
        </S.ActionsContainer>
        <S.Divider style={styles.mb10.static} />
        {shouldShowChart && (
          <>
            <S.ChartWrap>
              <Chart
                excludedPeriods={
                  shouldExcludeChartPeriods
                    ? [ChartPeriod.ONE_YEAR, ChartPeriod.SIX_MONTHS]
                    : undefined
                }
                currency={fiatCurrency}
                token={route.params.jettonAddress}
              />
            </S.ChartWrap>
            <S.Divider style={styles.mb0.static} />
          </>
        )}
      </S.HeaderWrap>
    );
  }, [
    jetton,
    jettonPrice,
    isWatchOnly,
    handleSend,
    handleReceive,
    showSwap,
    flags.disable_swap,
    handlePressSwap,
    shouldShowChart,
    fiatCurrency,
    route.params.jettonAddress,
  ]);

  if (!jetton) {
    return null;
  }

  return (
    <Screen>
      <Screen.Header
        subtitle={
          !config.get('disable_show_unverified_token') &&
          jetton.verification === JettonVerification.NONE && (
            <TouchableOpacity
              onPress={openUnverifiedTokenDetailsModal}
              hitSlop={unverifiedTokenHitSlop}
              style={styles.subtitleContainer}
            >
              <Text variant="body2" color="accentOrange">
                {t('approval.unverified_token')}
              </Text>
              <Spacer x={4} />
              <View style={styles.iconContainer}>
                <Icon name="ic-information-circle-12" color="accentOrange" />
              </View>
            </TouchableOpacity>
          )
        }
        title={jetton.metadata?.name || Address.toShort(jetton.jettonAddress)}
        rightContent={
          <PopupMenu
            items={[
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleOpenExplorer}
                text={t('jetton_open_explorer')}
                icon={<Icon name="ic-globe-16" color="accentBlue" />}
              />,
            ]}
          >
            <S.HeaderViewDetailsButton onPress={() => null}>
              <Icon name="ic-ellipsis-16" color="iconPrimary" />
            </S.HeaderViewDetailsButton>
          </PopupMenu>
        }
      />
      <ActivityList
        ListLoaderComponent={<Skeleton.List />}
        ListHeaderComponent={renderHeader}
        onLoadMore={jettonActivityList.loadMore}
        onReload={jettonActivityList.reload}
        isReloading={jettonActivityList.isReloading}
        isLoading={jettonActivityList.isLoading}
        sections={jettonActivityList.sections}
        hasMore={jettonActivityList.hasMore}
        error={jettonActivityList.error}
      />
    </Screen>
  );
};

const styles = Steezy.create({
  subtitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    marginTop: 2,
  },
  mb10: {
    marginBottom: 10,
  },
  mb0: {
    marginBottom: 0,
  },
});
