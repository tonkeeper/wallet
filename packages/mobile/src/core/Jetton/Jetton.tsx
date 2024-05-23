import React, { useCallback, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import { PopupMenu, PopupMenuItem, Skeleton, Text } from '$uikit';
import { useJetton } from '$hooks/useJetton';
import { useTokenPrice } from '$hooks/useTokenPrice';
import {
  AppStackRouteNames,
  MainStackRouteNames,
  openDAppBrowser,
  openSend,
} from '$navigation';

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
  Button,
  Icon,
  Screen,
  Spacer,
  Steezy,
  TouchableOpacity,
  View,
  useTheme,
} from '@tonkeeper/uikit';
import Svg, { G, Rect, Path, Defs, ClipPath } from 'react-native-svg';

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
import { reset } from '$navigation/imperative';
import { InteractionManager } from 'react-native';

const W5Icon = () => {
  const theme = useTheme();

  return (
    <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <Defs>
        <ClipPath id="clip0_33898_11372">
          <Rect width="44" height="44" rx="12" fill={theme.constantWhite} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_33898_11372)">
        <Rect width="44" height="44" rx="12" fill={theme.backgroundContentTint} />
        <Rect width="44" height="44" fill={theme.accentGreen} />
        <Path
          d="M9.71582 27.3696L6.97803 17.6387C6.86523 17.2183 6.80371 16.7671 6.80371 16.4902C6.80371 15.5366 7.48047 14.8804 8.46484 14.8804C9.36719 14.8804 9.90039 15.4648 10.1875 16.7363L11.9307 24.4883H12.0947L13.9814 16.6851C14.2891 15.4136 14.8018 14.8804 15.7554 14.8804C16.709 14.8804 17.2422 15.4341 17.5498 16.6851L19.4263 24.4883H19.6006L21.272 16.7363C21.5283 15.4854 22.1025 14.8804 23.0151 14.8804C23.979 14.8804 24.6558 15.5366 24.6558 16.4595C24.6558 16.7466 24.6045 17.1875 24.5327 17.4336L21.7949 27.3696C21.4668 28.5488 20.8516 29.082 19.8262 29.082C18.7495 29.082 18.0625 28.5488 17.7344 27.2773L15.8271 20.0586H15.6938L13.7661 27.3696C13.4688 28.4873 12.7715 29.082 11.7666 29.082C10.7515 29.082 10.085 28.6616 9.71582 27.3696ZM26.1221 26.1289C26.1221 25.3291 26.645 24.6626 27.4756 24.6626C27.9678 24.6626 28.3472 24.8472 28.7368 25.3086C29.4443 26.1802 30.1826 26.5903 31.1157 26.5903C32.4692 26.5903 33.4331 25.6777 33.4331 24.3242C33.4331 23.0425 32.5103 22.1606 31.2183 22.1606C30.5825 22.1606 29.9058 22.4067 29.2905 22.8477C28.7778 23.2476 28.4189 23.3706 28.0088 23.3706C27.0039 23.3706 26.2554 22.6631 26.3271 21.6274L26.6655 16.644C26.7373 15.5469 27.4141 14.9932 28.6958 14.9932H34.52C35.5044 14.9932 36.0581 15.4956 36.0581 16.3569C36.0581 17.208 35.5146 17.6797 34.52 17.6797H29.3726L29.147 20.7148H29.3213C29.8135 20.0688 30.9209 19.6484 32.1309 19.6484C34.8379 19.6484 36.6631 21.4839 36.6631 24.2319C36.6631 27.2979 34.4688 29.3076 31.085 29.3076C28.2651 29.3076 26.1221 27.7798 26.1221 26.1289Z"
          fill={theme.constantWhite}
        />
      </G>
    </Svg>
  );
};

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

  const addWalletV5 = useCallback(async () => {
    try {
      await tk.addWalletV5();

      reset(MainStackRouteNames.Tabs);

      setTimeout(() => {
        nav.openModal('/switch-wallet', {
          withW5Flash: true,
        });
      }, 300);
    } catch {}
  }, [nav]);

  const openW5Stories = useCallback(() => {
    nav.navigate(AppStackRouteNames.W5StoriesScreen, {
      onPressButton: () => {
        InteractionManager.runAfterInteractions(() => {
          addWalletV5();
        });
      },
    });
  }, [addWalletV5, nav]);

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
        {Address.compare(config.get('usdt_jetton_master'), jetton.metadata.address) &&
        tk.wallet.isMnemonic &&
        !tk.hasW5WithCurrentPubkey ? (
          <View style={styles.upgradeContainer}>
            <View style={styles.updateBackground} />
            <View style={styles.row}>
              <View style={styles.flexOne}>
                <Text variant="label1">{t('upgrade_to_w5.title')}</Text>
                <Text variant="body2" style={styles.upgradeDescription.static}>
                  {t('upgrade_to_w5.description')}
                </Text>
              </View>
              <Spacer x={16} />
              <View style={styles.upgradeIcon}>
                <W5Icon />
              </View>
            </View>
            <Spacer y={12} />
            <View style={styles.upgradeButtons}>
              <Button
                size="small"
                color="green"
                title={t('upgrade_to_w5.add_button')}
                onPress={addWalletV5}
              />
              <Spacer x={8} />
              <Button
                size="small"
                color="greenTransparent"
                title={t('upgrade_to_w5.more_button')}
                onPress={openW5Stories}
              />
            </View>
            <Spacer y={4} />
          </View>
        ) : null}
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
    handlePressSwap,
    showSwap,
    flags.disable_swap,
    addWalletV5,
    openW5Stories,
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

const styles = Steezy.create(({ colors, corners }) => ({
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
  upgradeContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: corners.medium,
    overflow: 'hidden',
    position: 'relative',
  },
  updateBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accentGreen,
    opacity: 0.16,
  },
  flexOne: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  upgradeIcon: {
    paddingTop: 4,
  },
  upgradeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeDescription: {
    opacity: 0.56,
  },
}));
