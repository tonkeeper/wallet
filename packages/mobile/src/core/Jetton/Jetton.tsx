import React, { useCallback, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import { PopupMenu, PopupMenuItem, Skeleton, Text } from '$uikit';
import { useJetton } from '$hooks/useJetton';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { openDAppBrowser, openSend } from '$navigation';

import { formatter } from '$utils/formatter';
import { useNavigation } from '@tonkeeper/router';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Events, JettonVerification, SendAnalyticsFrom } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';
import { Address } from '@tonkeeper/core';
import {
  ActionButtons,
  Icon,
  Screen,
  Spacer,
  Steezy,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';

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
import { formatDate } from '@tonkeeper/shared/utils/date';

const unverifiedTokenHitSlop = { top: 4, left: 4, bottom: 4, right: 4 };

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const flags = useFlags(['disable_swap']);
  const jetton = useJetton(route.params.jettonAddress);
  const jettonActivityList = useJettonActivityList(jetton.jettonAddress);
  const jettonPrice = useTokenPrice(jetton.jettonAddress, jetton.balance);
  const lockedJettonPrice = useTokenPrice(
    jetton.jettonAddress,
    jetton.lock?.amount.toString() ?? '0',
  );
  const wallet = useWallet();

  const isWatchOnly = wallet && wallet.isWatchOnly;
  const fiatCurrency = useWalletCurrency();
  const shouldExcludeChartPeriods = config.get('exclude_jetton_chart_periods');

  const nav = useNavigation();

  const shouldShowChart = jettonPrice.fiat !== 0;
  const showSwap = jettonPrice.fiat !== 0;

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
            {jetton.lock ? (
              <>
                <Spacer y={12} />
                <Text variant="body2" color="textSecondary">
                  {formatter.format(jetton.lock.amount, {
                    decimals: jetton.metadata.decimals,
                    currency: jetton.metadata.symbol,
                    currencySeparator: 'wide',
                  })}
                  <Text variant="body2" color="textTertiary">
                    {' '}·{' '}
                  </Text>
                  {lockedJettonPrice.formatted.totalFiat}
                </Text>
                <Text variant="body2" color="textTertiary">
                  {t('jetton_locked_till', {
                    date: formatDate(jetton.lock.till * 1000, 'd MMM yyyy'),
                  })}
                </Text>
              </>
            ) : null}
          </S.JettonAmountWrapper>
          {jetton.metadata.image ? (
            <S.Logo source={{ uri: jetton.metadata.image }} />
          ) : null}
        </S.FlexRow>
        <Spacer y={24} />
        <ActionButtons
          buttons={[
            {
              id: 'send',
              disabled: isWatchOnly,
              onPress: handleSend,
              icon: 'ic-arrow-up-outline-28',
              title: t('wallet.send_btn'),
            },
            {
              id: 'receive',
              onPress: handleReceive,
              icon: 'ic-arrow-down-outline-28',
              title: t('wallet.receive_btn'),
            },
            {
              id: 'swap',
              onPress: handlePressSwap,
              icon: 'ic-swap-horizontal-outline-28',
              title: t('wallet.swap_btn'),
              visible: !isWatchOnly && showSwap && !flags.disable_swap,
            },
          ]}
        />
        <Spacer y={24} />
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
    jettonPrice.formatted.totalFiat,
    lockedJettonPrice.formatted.totalFiat,
    isWatchOnly,
    handleSend,
    handleReceive,
    showSwap,
    flags.disable_swap,
    handlePressSwap,
    shouldShowChart,
    shouldExcludeChartPeriods,
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
        title={jetton.metadata?.symbol || Address.toShort(jetton.jettonAddress)}
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
