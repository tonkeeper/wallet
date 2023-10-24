import React, { memo, useCallback, useMemo } from 'react';
import * as S from './Jetton.style';
import {
  Icon,
  IconButton,
  PopupMenu,
  PopupMenuItem,
  Skeleton,
  SwapIcon,
  Text,
} from '$uikit';
import { ns } from '$utils';
import { openDAppBrowser, openSend } from '$navigation';
import { getServerConfig } from '$shared/constants';
import { formatter } from '$utils/formatter';
import { navigation, useNavigation } from '@tonkeeper/router';
import { useSwapStore } from '$store/zustand/swap';
import { shallow } from 'zustand/shallow';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Events, SendAnalyticsFrom } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';
import { Address } from '@tonkeeper/core';
import { Screen, Toast } from '@tonkeeper/uikit';

import { useJettonActivityList } from '@tonkeeper/shared/query/hooks/useJettonActivityList';
import { ActivityList } from '@tonkeeper/shared/components';
import { openReceiveJettonModal } from '@tonkeeper/shared/modals/ReceiveJettonModal';
import { JettonBalance } from '@tonkeeper/core/src/TonAPI';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { useParams } from '$navigation/imperative';
import BigNumber from 'bignumber.js';
import { useCurrency } from '@tonkeeper/shared/hooks/useCurrency';
import { useNewWallet } from '@tonkeeper/shared/hooks/useWallet';

export async function openJetton(jettonAddress: string) {
  const openScreen = (jettonBalance: JettonBalance) => {
    navigation.push('Jetton', { item: jettonBalance });
  };

  try {
    const loadedJetton = tk.wallet.jettons.getLoadedJetton(jettonAddress);
    if (loadedJetton) {
      openScreen(loadedJetton);
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load jetton');
  }
}

interface JettonScreenProps {
  item: JettonBalance;
}

export const JettonScreen = memo(() => {
  const { item } = useParams<JettonScreenProps>();

  const flags = useFlags(['disable_swap']);
  const jettonActivityList = useJettonActivityList(item.jetton.address);
  const address = useNewWallet((state) => state.ton.address.raw);
  const currency = useCurrency();

  const nav = useNavigation();

  const showSwap = useSwapStore((s) => !!s.assets[item.jetton.address], shallow);

  const handleSend = useCallback(() => {
    trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.TokenScreen });
    openSend({
      currency: item.jetton.address,
      isJetton: true,
      from: SendAnalyticsFrom.TokenScreen,
    });
  }, [item.jetton.address]);

  const handleReceive = useCallback(() => {
    openReceiveJettonModal(item.jetton.address);
  }, [item.jetton.address]);

  const handlePressSwap = React.useCallback(() => {
    nav.openModal('Swap', { jettonAddress: item.jetton.address });
  }, [item.jetton.address, nav]);

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      getServerConfig('accountExplorer').replace('%s', address) +
        `/jetton/${item.jetton.address}`,
    );
  }, [address, item.jetton.address]);

  const quantity = useMemo(() => {
    return formatter.fromNano(item.balance, item.jetton.decimals);
  }, [item.balance, item.jetton.decimals]);

  const fiatQuantity = useMemo(() => {
    if (item.price) {
      const fiat = new BigNumber(quantity).multipliedBy(item.price.value);
      return formatter.format(fiat, { currency });
    }
  }, [item.price, quantity, currency]);

  const price = useMemo(() => {
    if (item.price.value) {
      return formatter.format(item.price.value, { currency });
    }
  }, [item.price.value, currency]);

  const renderHeader = useMemo(() => {
    return (
      <S.HeaderWrap>
        <S.FlexRow>
          <S.JettonAmountWrapper>
            <HideableAmount variant="h2">
              {formatter.formatNano(item.balance, {
                decimals: item.jetton.decimals,
                postfix: item.jetton.symbol,
                ignoreZeroTruncate: true,
                withoutTruncate: true,
              })}
            </HideableAmount>
            <HideableAmount
              style={{ marginTop: 2 }}
              variant="body2"
              color="foregroundSecondary"
            >
              {fiatQuantity ? fiatQuantity : t('jetton_token')}
            </HideableAmount>
            {fiatQuantity && (
              <Text style={{ marginTop: 12 }} variant="body2" color="foregroundSecondary">
                {t('jetton_price')} {price}
              </Text>
            )}
          </S.JettonAmountWrapper>
          {item.jetton.image ? <S.Logo source={{ uri: item.jetton.image }} /> : null}
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
    item.balance,
    item.jetton.decimals,
    item.jetton.symbol,
    item.jetton.image,
    fiatQuantity,
    price,
    handleSend,
    handleReceive,
    showSwap,
    flags.disable_swap,
    handlePressSwap,
  ]);

  return (
    <Screen>
      <Screen.Header
        title={item.jetton.name || Address.toShort(item.jetton.address)}
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
});
