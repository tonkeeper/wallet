import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WalletProps } from './Wallet.interface';
import * as S from './Wallet.style';
import {
  Button,
  Icon,
  PopupMenu,
  PopupMenuItem,
  ShowMore,
  Text,
  ScrollHandler,
  IconButton,
} from '$uikit';
import { useTheme, useTranslator, useWalletInfo } from '$hooks';
import { openReceive, openRequireWalletModal, openSend } from '$navigation';
import {
  walletActions,
  walletAddressSelector,
  walletWalletSelector,
} from '$store/wallet';
import { Linking, View } from 'react-native';
import { ns, toLocaleNumber } from '$utils';
import { CryptoCurrencies } from '$shared/constants';
import { toastActions } from '$store/toast';
import { t } from '$translation';
import { useNavigation } from '$libs/navigation';
import { Chart } from '$uikit/Chart/Chart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

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
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_chat'),
    url: t('wallet_toncommunity_chat_link'),
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_community'),
    url: t('wallet_toncommunity_link'),
  },
  {
    icon: 'ic-doc-16',
    text: 'Whitepaper',
    url: 'https://ton.org/whitepaper.pdf',
  },
  {
    icon: 'ic-magnifying-glass-16',
    text: 'ton.api',
    url: 'https://tonapi.io',
  },
  {
    icon: 'ic-code-16',
    text: t('wallet_source_code'),
    url: 'https://github.com/ton-blockchain/ton',
  },
];

export const Wallet: FC<WalletProps> = ({ route }) => {
  const theme = useTheme();
  const currency = route.params.currency;
  const wallet = useSelector(walletWalletSelector);
  const address = useSelector(walletAddressSelector);
  const t = useTranslator();
  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');
  const nav = useNavigation();
  const { bottom: paddingBottom } = useSafeAreaInsets();

  useEffect(() => {
    if (currency === CryptoCurrencies.Ton && wallet && wallet.ton.isLockup()) {
      wallet.ton
        .getWalletInfo(address[currency])
        .then((info: any) => {
          setLockupDeploy(
            ['empty', 'uninit'].includes(info.status) ? 'deploy' : 'deployed',
          );
        })
        .catch((err: any) => {
          dispatch(toastActions.fail(err.message));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencyUpper = useMemo(() => {
    return currency?.toUpperCase();
  }, [currency]);

  const { amount, fiatInfo } = useWalletInfo(currency);
  const shouldRenderSellButton = useMemo(() => +amount > 0, [amount]);

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openReceive(currency);
  }, [currency, wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openSend(currency);
  }, [currency, wallet]);

  const handleOpenExchange = useCallback(
    (category: 'buy' | 'sell') => () => {
      if (!wallet) {
        return openRequireWalletModal();
      }
      nav.openModal('Exchange', { category });
    },
    [nav, wallet],
  );

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

  const handleOpenExplorer = useCallback(() => {
    Linking.openURL(`https://tonapi.io/account/${address.ton}`);
  }, [address.ton]);

  const renderContent = useCallback(() => {
    return (
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: paddingBottom + ns(16) }}
      >
        <S.HeaderWrap>
          <S.FlexRow>
            <S.AmountWrapper>
              <Text variant="h2">
                {toLocaleNumber(amount)} {currencyUpper}
              </Text>
              <Text style={{ marginTop: 2 }} variant="body2" color="foregroundSecondary">
                {fiatInfo.amount}
              </Text>
              <S.AboutWrapper>
                <ShowMore
                  backgroundColor={theme.colors.backgroundPrimary}
                  maxLines={2}
                  text={t('about_ton')}
                />
              </S.AboutWrapper>
            </S.AmountWrapper>
            <S.IconWrapper>
              <Icon size={40} name="ic-ton-28" color="constantLight" />
            </S.IconWrapper>
          </S.FlexRow>
          <S.Divider />
          <S.ActionsContainer>
            <IconButton
              onPress={handleOpenExchange('buy')}
              iconName="ic-plus-28"
              title={t('wallet.buy_btn')}
            />
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
            {shouldRenderSellButton && (
              <IconButton
                onPress={handleOpenExchange('sell')}
                iconName="ic-minus-28"
                title={t('wallet.sell_btn')}
              />
            )}
          </S.ActionsContainer>
          <S.Divider />
        </S.HeaderWrap>
        <S.ChartWrap>
          <Chart />
        </S.ChartWrap>
        <S.Divider style={{ marginBottom: ns(22) }} />
        <S.ExploreWrap>
          <Text style={{ marginBottom: ns(14) }} variant="h3" color="foregroundPrimary">
            {t('wallet_about')}
          </Text>
          <S.ExploreButtons>
            {exploreActions.map((action) => (
              <Button
                onPress={() => Linking.openURL(action.url)}
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
        {wallet && wallet.ton.isLockup() && (
          <View style={{ padding: ns(16) }}>
            <Button
              onPress={handleDeploy}
              disabled={lockupDeploy === 'deployed'}
              isLoading={lockupDeploy === 'loading'}
            >
              {lockupDeploy === 'deploy' ? 'Deploy Wallet' : 'Deployed'}
            </Button>
          </View>
        )}
      </Animated.ScrollView>
    );
  }, [
    paddingBottom,
    amount,
    currencyUpper,
    fiatInfo.amount,
    theme.colors.backgroundPrimary,
    t,
    handleOpenExchange,
    handleSend,
    shouldRenderSellButton,
    handleReceive,
    wallet,
    handleDeploy,
    lockupDeploy,
  ]);

  return (
    <S.Wrap>
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
        isLargeNavBar={false}
        navBarTitle={'Toncoin'}
      >
        {renderContent()}
      </ScrollHandler>
    </S.Wrap>
  );
};
