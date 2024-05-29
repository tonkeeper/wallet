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
import { useWallet, useWalletCurrency, useWalletStatus } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { Chart } from '$shared/components/Chart/new/Chart';
import { ChartPeriod } from '$store/zustand/chart';
import { formatDate } from '@tonkeeper/shared/utils/date';
import { reset } from '$navigation/imperative';
import { InteractionManager } from 'react-native';
import { DevFeature, useDevFeatureEnabled } from '$store';

const W5Icon = () => {
  const theme = useTheme();

  return (
    <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <Defs>
        <ClipPath id="clip0_34650_3704">
          <Rect width="44" height="44" rx="12" fill={theme.constantWhite} />
        </ClipPath>
        <ClipPath id="clip1_34650_3704">
          <Rect width="44" height="44" fill={theme.constantWhite} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_34650_3704)">
        <Rect width="44" height="44" rx="12" fill={theme.backgroundContentTint} />
        <G clipPath="url(#clip1_34650_3704)">
          <Rect width="44" height="44" fill={theme.accentGreen} />
          <Path
            d="M9.71582 20.8696L6.97803 11.1387C6.86523 10.7183 6.80371 10.2671 6.80371 9.99023C6.80371 9.03662 7.48047 8.38037 8.46484 8.38037C9.36719 8.38037 9.90039 8.96484 10.1875 10.2363L11.9307 17.9883H12.0947L13.9814 10.1851C14.2891 8.91357 14.8018 8.38037 15.7554 8.38037C16.709 8.38037 17.2422 8.93408 17.5498 10.1851L19.4263 17.9883H19.6006L21.272 10.2363C21.5283 8.98535 22.1025 8.38037 23.0151 8.38037C23.979 8.38037 24.6558 9.03662 24.6558 9.95947C24.6558 10.2466 24.6045 10.6875 24.5327 10.9336L21.7949 20.8696C21.4668 22.0488 20.8516 22.582 19.8262 22.582C18.7495 22.582 18.0625 22.0488 17.7344 20.7773L15.8271 13.5586H15.6938L13.7661 20.8696C13.4688 21.9873 12.7715 22.582 11.7666 22.582C10.7515 22.582 10.085 22.1616 9.71582 20.8696ZM26.1221 19.6289C26.1221 18.8291 26.645 18.1626 27.4756 18.1626C27.9678 18.1626 28.3472 18.3472 28.7368 18.8086C29.4443 19.6802 30.1826 20.0903 31.1157 20.0903C32.4692 20.0903 33.4331 19.1777 33.4331 17.8242C33.4331 16.5425 32.5103 15.6606 31.2183 15.6606C30.5825 15.6606 29.9058 15.9067 29.2905 16.3477C28.7778 16.7476 28.4189 16.8706 28.0088 16.8706C27.0039 16.8706 26.2554 16.1631 26.3271 15.1274L26.6655 10.144C26.7373 9.04688 27.4141 8.49316 28.6958 8.49316H34.52C35.5044 8.49316 36.0581 8.99561 36.0581 9.85693C36.0581 10.708 35.5146 11.1797 34.52 11.1797H29.3726L29.147 14.2148H29.3213C29.8135 13.5688 30.9209 13.1484 32.1309 13.1484C34.8379 13.1484 36.6631 14.9839 36.6631 17.7319C36.6631 20.7979 34.4688 22.8076 31.085 22.8076C28.2651 22.8076 26.1221 21.2798 26.1221 19.6289Z"
            fill={theme.constantWhite}
          />
          <Path
            d="M7.70239 34.3596V27.6426C7.70239 26.8845 8.09131 26.5022 8.88892 26.5022H11.4531C13.0879 26.5022 14.1162 27.3591 14.1162 28.717C14.1162 29.7322 13.5361 30.4639 12.5737 30.688V30.7671C13.7866 30.8792 14.5776 31.7361 14.5776 32.9622C14.5776 34.5046 13.3516 35.5 11.4465 35.5H8.88892C8.09131 35.5 7.70239 35.1243 7.70239 34.3596ZM9.46899 30.2463H10.6423C11.8354 30.2463 12.3628 29.8047 12.3628 29.0203C12.3628 28.2886 11.875 27.8403 11.0444 27.8403H9.46899V30.2463ZM9.46899 34.1619H10.7874C12.1914 34.1619 12.7649 33.7136 12.7649 32.8567C12.7649 32.0063 12.198 31.4856 11.1565 31.4856H9.46899V34.1619ZM15.9949 34.3596V27.6426C15.9949 26.8845 16.3838 26.5022 17.1814 26.5022H21.1628C21.6111 26.5022 21.9143 26.7988 21.9143 27.2339C21.9143 27.6689 21.6111 27.959 21.1628 27.959H17.7615V30.2661H20.9783C21.4001 30.2661 21.6836 30.5364 21.6836 30.9517C21.6836 31.3669 21.4001 31.6306 20.9783 31.6306H17.7615V34.0432H21.1431C21.6111 34.0432 21.9143 34.3333 21.9143 34.7749C21.9143 35.2166 21.6111 35.5 21.1431 35.5H17.1814C16.3838 35.5 15.9949 35.1243 15.9949 34.3596ZM26.021 35.5659C25.4673 35.5659 25.1311 35.21 25.1311 34.6167V27.9985H23.2261C22.7844 27.9985 22.4614 27.6821 22.4614 27.2537C22.4614 26.8186 22.7844 26.5022 23.2261 26.5022H28.8225C29.2708 26.5022 29.5872 26.812 29.5872 27.2537C29.5872 27.6887 29.2708 27.9985 28.8225 27.9985H26.9109V34.6167C26.9109 35.2034 26.5681 35.5659 26.021 35.5659ZM30.0684 35.5791C29.5806 35.5791 29.2444 35.2825 29.2444 34.8342C29.2444 34.6562 29.2905 34.4519 29.4026 34.1157L31.6702 27.6162C31.9536 26.7791 32.3557 26.4297 33.1072 26.4297C33.8521 26.4297 34.2476 26.7725 34.531 27.6162L36.7986 34.1157C36.8909 34.3992 36.937 34.6167 36.937 34.8013C36.937 35.2759 36.6008 35.5791 36.0933 35.5791C35.6121 35.5791 35.3352 35.3286 35.1572 34.7156L34.6497 33.1863H31.4922L30.9912 34.7156C30.8066 35.3352 30.543 35.5791 30.0684 35.5791ZM31.8877 31.8613H34.2607L33.1204 28.2227H33.0347L31.8877 31.8613Z"
            fill={theme.constantWhite}
          />
        </G>
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

  const isStoriesShown = useDevFeatureEnabled(DevFeature.W5StoriesShown);

  const openW5Stories = useCallback(() => {
    nav.navigate(AppStackRouteNames.W5StoriesScreen, {
      onPressButton: () => {
        InteractionManager.runAfterInteractions(() => {
          addWalletV5();
        });
      },
    });
  }, [addWalletV5, nav]);

  const hideW5Block = useCallback(() => {
    tk.wallets.forEach((w) => {
      if (w.pubkey === wallet.pubkey) {
        w.hideW5Block();
      }
    });
  }, [wallet.pubkey]);

  const isW5BlockHidden = useWalletStatus((s) => s.isW5BlockHidden);

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
        !tk.hasW5WithCurrentPubkey &&
        !isW5BlockHidden ? (
          <View style={styles.upgradeContainer}>
            <View style={styles.updateBackground} />
            <View style={styles.row}>
              <View style={styles.flexOne}>
                <Text variant="label1">{t('upgrade_to_w5.title')}</Text>
                <Text variant="body2" color="textSecondary">
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
                title={
                  isStoriesShown
                    ? t('upgrade_to_w5.about_button')
                    : t('upgrade_to_w5.try_button')
                }
                onPress={openW5Stories}
              />
              <Spacer x={8} />
              {isStoriesShown ? (
                <Button
                  size="small"
                  color="tertiary"
                  title={t('upgrade_to_w5.hide_button')}
                  onPress={hideW5Block}
                />
              ) : null}
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
    isW5BlockHidden,
    isStoriesShown,
    openW5Stories,
    hideW5Block,
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
    backgroundColor: colors.backgroundContent,
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
}));
