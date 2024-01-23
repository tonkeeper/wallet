import React, { useCallback, useMemo } from 'react';
import { JettonProps } from './Jetton.interface';
import * as S from './Jetton.style';
import { IconButton, PopupMenu, PopupMenuItem, Skeleton, SwapIcon, Text } from '$uikit';
import { ns } from '$utils';
import { useJetton } from '$hooks/useJetton';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { openDAppBrowser, openSend } from '$navigation';
import { getServerConfig } from '$shared/constants';
import { useSelector } from 'react-redux';

import { walletAddressSelector } from '$store/wallet';
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
import { Screen, Steezy, View, Icon, Spacer } from '@tonkeeper/uikit';

import { useJettonActivityList } from '@tonkeeper/shared/query/hooks/useJettonActivityList';
import { ActivityList } from '@tonkeeper/shared/components';
import { openReceiveJettonModal } from '@tonkeeper/shared/modals/ReceiveJettonModal';
import { TokenType } from '$core/Send/Send.interface';
import { config } from '@tonkeeper/shared/config';

export const Jetton: React.FC<JettonProps> = ({ route }) => {
  const flags = useFlags(['disable_swap']);
  const jetton = useJetton(route.params.jettonAddress);
  const jettonActivityList = useJettonActivityList(jetton.jettonAddress);
  const address = useSelector(walletAddressSelector);
  const jettonPrice = useTokenPrice(jetton.jettonAddress, jetton.balance);

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

  if (!jetton) {
    return null;
  }

  return (
    <Screen>
      <Screen.Header
        subtitle={
          !config.get('disable_show_unverified_token') &&
          jetton.verification === JettonVerification.NONE && (
            <View style={styles.subtitleContainer}>
              <View style={styles.iconContainer}>
                <Icon name="ic-exclamationmark-triangle-12" color="accentOrange" />
              </View>
              <Spacer x={4} />
              <Text variant="body2" color="accentOrange">
                {t('approval.unverified_token')}
              </Text>
            </View>
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
                icon={<Icon name="ic-globe-16" color="accentPrimary" />}
              />,
            ]}
          >
            <S.HeaderViewDetailsButton onPress={() => null}>
              <Icon name="ic-ellipsis-16" color="foregroundPrimary" />
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
});
