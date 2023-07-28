import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WalletProps } from './Wallet.interface';
import * as S from './Wallet.style';
import { useWalletInfo } from '$hooks';
import {
  Button,
  Icon,
  PopupMenu,
  PopupMenuItem,
  Text,
  IconButton,
  SwapIcon,
} from '$uikit';
import {
  openDAppBrowser,
  openReceive,
  openRequireWalletModal,
  openSend,
} from '$navigation';
import {
  walletActions,
  walletWalletSelector,
} from '$store/wallet';
import { Linking, Platform, View } from 'react-native';
import { delay, ns } from '$utils';
import { CryptoCurrencies, Decimals, getServerConfig } from '$shared/constants';
import { t } from '$translation';
import { useNavigation } from '@tonkeeper/router';
import { Chart } from '$shared/components/Chart/new/Chart';
import { formatter } from '$utils/formatter';
import { Toast } from '$store';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { TonIcon } from '../../components/TonIcon';
import { Screen } from '@tonkeeper/uikit';

import { TransactionsList } from '@tonkeeper/shared/components';
import { useEventsByAccount } from '@tonkeeper/core/src/query/useEventsByAccount';
import { AccountEventsMapper } from '@tonkeeper/shared/mappers/AccountEventsMapper';
import { useWallet } from '../../tabs/useWallet';

const exploreActions = [
  {
    icon: 'ic-globe-16',
    text: 'ton.org',
    url: 'https://ton.org',
  },
  {
    icon: 'ic-twitter-16',
    text: 'Twitter',
    url: 'https://twitter.com/ton_blockchain',
    scheme: 'twitter://search',
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_chat'),
    url: t('wallet_toncommunity_chat_link'),
    scheme: 'tg://',
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_community'),
    url: t('wallet_toncommunity_link'),
    scheme: 'tg://',
  },
  {
    icon: 'ic-doc-16',
    text: 'Whitepaper',
    openInBrowser: Platform.OS === 'android',
    url: 'https://ton.org/whitepaper.pdf',
  },
  {
    icon: 'ic-magnifying-glass-16',
    text: 'tonviewer.com',
    url: 'https://tonviewer.com',
  },
  {
    icon: 'ic-code-16',
    text: t('wallet_source_code'),
    url: 'https://github.com/ton-blockchain/ton',
    scheme: 'github://',
  },
];



import { AccountEvent, Action } from '@tonkeeper/core/src/TonAPI';

const seeIfTonTransfer = (action: Action) => {
  if (action.type === 'TonTransfer') {
    return true;
  } else if (action.type === 'ContractDeploy') {
    if (action.ContractDeploy?.interfaces?.includes('wallet')) {
      return true;
    }
  }
  return false;
};

export const groupAndFilterTonActivityItems = (data: AccountEvent) => {
  const eventsMap = [];

  Object.entries(data).forEach(([key, event]) => {
    const tonTransferEvent = event.actions.every(seeIfTonTransfer);
    if (tonTransferEvent) {
      eventsMap.push(event);
    }
  });
  return eventsMap;
};


export const ToncoinScreen = memo<WalletProps>(() => {
  const flags = useFlags(['disable_swap']);

  const wallet = useSelector(walletWalletSelector);


  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');
  const nav = useNavigation();

  const walletAddr = useWallet();
  const events = useEventsByAccount(walletAddr.address.raw, {
    modify: (data) => {
      const filtered = groupAndFilterTonActivityItems(data ?? []);
      return AccountEventsMapper(filtered ?? [], walletAddr.address.raw)
    },
    fetchMoreParams: (lastPage) => ({ before_lt: lastPage.next_from }),
    fetchMoreEnd: (data) => data.events.length < 1,
  });

  // useEffect(() => {
  //   if (wallet && wallet.ton.isLockup()) {
  //     wallet.ton
  //       .getWalletInfo(walletAddr.address.friendly)
  //       .then((info: any) => {
  //         setLockupDeploy(
  //           ['empty', 'uninit', 'nonexist'].includes(info.status) ? 'deploy' : 'deployed',
  //         );
  //       })
  //       .catch((err: any) => {
  //         Toast.fail(err.message);
  //       });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleOpenAction = useCallback(async (action: any) => {
    try {
      let shouldOpenInBrowser = action.openInBrowser;
      if (action.scheme) {
        shouldOpenInBrowser = await Linking.canOpenURL(action.scheme);
      }
      if (shouldOpenInBrowser) {
        return Linking.openURL(action.url);
      }
      openDAppBrowser(action.url);
    } catch (e) {
      console.log(e);
      openDAppBrowser(action.url);
    }
  }, []);


  const { amount, tokenPrice } = useWalletInfo(CryptoCurrencies.Ton);

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openReceive(CryptoCurrencies.Ton);
  }, [wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openSend(CryptoCurrencies.Ton);
  }, [wallet]);

  const handleOpenExchange = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    nav.openModal('Exchange');
  }, [nav, wallet]);

  const handlePressSwap = useCallback(() => {
    if (wallet) {
      nav.openModal('Swap');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

  const handleOpenExplorer = useCallback(async () => {
    await delay(200);
    openDAppBrowser(getServerConfig('accountExplorer').replace('%s', walletAddr.address.raw));
  }, [walletAddr.address.raw]);

  const header = (
    <>
      <S.TokenInfoWrap>
        <S.FlexRow>
          <S.AmountWrapper>
            <HideableAmount variant="h2">
              {formatter.format(amount, {
                currency: 'TON',
                currencySeparator: 'wide',
                decimals: Decimals[CryptoCurrencies.Ton]!,
              })}
            </HideableAmount>
            <HideableAmount
              style={{ marginTop: 2 }}
              variant="body2"
              color="foregroundSecondary"
            >
              {tokenPrice.formatted.totalFiat ?? '-'}
            </HideableAmount>
          </S.AmountWrapper>
          <TonIcon size="medium" showDiamond />
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
          <IconButton
            onPress={handleOpenExchange}
            iconName="ic-plus-28"
            title={t('wallet.buy_btn')}
          />
          {!flags.disable_swap && (
            <IconButton
              onPress={handlePressSwap}
              icon={<SwapIcon />}
              title={t('wallet.swap_btn')}
            />
          )}
        </S.ActionsContainer>
        <S.Divider />
      </S.TokenInfoWrap>
      <S.ChartWrap>
        <Chart />
      </S.ChartWrap>
      <S.Divider style={{ marginBottom: ns(22) }} />
      <S.ExploreWrap>
        <Text
          style={{ marginBottom: ns(14) }}
          variant="h3"
          color="foregroundPrimary"
        >
          {t('wallet_about')}
        </Text>
        <S.ExploreButtons>
          {exploreActions.map((action) => (
            <Button
              onPress={() => handleOpenAction(action)}
              key={action.text}
              before={
                <Icon
                  name={action.icon}
                  color="foregroundPrimary"
                  style={{ marginRight: 8 }}
                />
              }
              style={{ marginRight: 8, marginBottom: 8 }}
              mode="secondary"
              size="medium_rounded"
            >
              {action.text}
            </Button>
          ))}
        </S.ExploreButtons>
      </S.ExploreWrap>
      {/* {wallet && wallet.ton.isLockup() && (
        <View style={{ padding: ns(16) }}>
          <Button
            onPress={handleDeploy}
            disabled={lockupDeploy === 'deployed'}
            isLoading={lockupDeploy === 'loading'}
          >
            {lockupDeploy === 'deploy' ? 'Deploy Wallet' : 'Deployed'}
          </Button>
        </View>
      )} */}
    </>
  );

  return (
    <Screen>
      <Screen.Header 
        title="Toncoin"
        rightContent={
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
      />

      <TransactionsList
        ListHeaderComponent={header}
        fetchMoreEnd={events.fetchMoreEnd}
        onFetchMore={events.fetchMore}
        refreshing={events.refreshing}
        onRefresh={events.refresh}
        loading={events.loading}
        events={events.data}
      />
    </Screen>
  );
});
