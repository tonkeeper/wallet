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
import { ActionButtonProps } from '$core/Balances/BalanceItem/BalanceItem.interface';
import { t } from '$translation';
import { useNavigation } from '$libs/navigation';
import { Chart } from '$uikit/Chart/Chart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

const ActionButton: FC<ActionButtonProps> = (props) => {
  const { children, onPress, icon, isLast } = props;

  return (
    <S.ActionWrapper isLast={isLast}>
      <S.Action onPress={onPress}>
        <S.ActionIcon>
          <Icon name={icon} color="constantLight" />
        </S.ActionIcon>
        <Text variant="label3" color="foregroundSecondary">
          {children}
        </Text>
      </S.Action>
    </S.ActionWrapper>
  );
};

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
  }, []);

  const currencyUpper = useMemo(() => {
    return currency?.toUpperCase();
  }, [currency]);

  const { amount, rate, fiatInfo } = useWalletInfo(currency);

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

  const handleOpenExchange = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    nav.openModal('Exchange');
  }, [nav, wallet]);

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
        contentContainerStyle={{ paddingBottom }}
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
            <ActionButton onPress={handleOpenExchange} icon="ic-plus-28">
              {t('wallet_buy')}
            </ActionButton>
            <ActionButton onPress={handleSend} icon="ic-arrow-up-28">
              {t('wallet_send')}
            </ActionButton>
            <ActionButton isLast onPress={handleReceive} icon="ic-arrow-down-28">
              {t('wallet_receive')}
            </ActionButton>
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
    amount,
    currencyUpper,
    fiatInfo.amount,
    fiatInfo.color,
    fiatInfo.percent,
    handleDeploy,
    handleOpenExchange,
    handleReceive,
    handleSend,
    lockupDeploy,
    rate,
    t,
    theme.colors.backgroundPrimary,
    wallet,
    paddingBottom,
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
