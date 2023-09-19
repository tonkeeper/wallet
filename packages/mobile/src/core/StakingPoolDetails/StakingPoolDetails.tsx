import { usePoolInfo } from '$hooks/usePoolInfo';
import { useStakingRefreshControl } from '$hooks/useStakingRefreshControl';
import { MainStackRouteNames, openDAppBrowser, openSend } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import { NextCycle } from '$shared/components';
import {
  getServerConfig,
  KNOWN_STAKING_IMPLEMENTATIONS,
  Opacity,
} from '$shared/constants';
import { getStakingPoolByAddress, getStakingProviderById, useStakingStore } from '$store';
import {
  Button,
  Highlight,
  IconButton,
  ScrollHandler,
  Spacer,
  StakedTonIcon,
  Tag,
  Text,
} from '$uikit';
import { stakingFormatter } from '$utils/formatter';
import { RouteProp } from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { shallow } from 'zustand/shallow';
import * as S from './StakingPoolDetails.style';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { trackEvent } from '$utils/stats';
import { Events, SendAnalyticsFrom } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { useFlag } from '$utils/flags';
import { formatter } from '@tonkeeper/shared/formatter';
import { fiatCurrencySelector } from '$store/main';
import { useSelector } from 'react-redux';
import { IStakingLink, StakingLinkType } from './types';
import { Icon, TouchableOpacity } from '@tonkeeper/uikit';
import { getLinkIcon, getLinkTitle, getSocialLinkType } from './utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { PoolImplementationType } from '@tonkeeper/core/src/TonAPI';

interface Props {
  route: RouteProp<MainStackParamList, MainStackRouteNames.StakingPoolDetails>;
}

const LIQUIDITY_TOKEN_URL = 'https://tonstakers.com';

export const StakingPoolDetails: FC<Props> = (props) => {
  const {
    route: {
      params: { poolAddress },
    },
  } = props;

  const fiatCurrency = useSelector(fiatCurrencySelector);

  const tonstakersBeta = useFlag('tonstakers_beta');

  const pool = useStakingStore((s) => getStakingPoolByAddress(s, poolAddress), shallow);
  const poolStakingInfo = useStakingStore((s) => s.stakingInfo[pool.address], shallow);
  const provider = useStakingStore(
    (s) => getStakingProviderById(s, pool.implementation),
    shallow,
  );

  const refreshControl = useStakingRefreshControl();

  const {
    infoRows,
    stakingJetton,
    balance,
    pendingDeposit,
    pendingWithdraw,
    readyWithdraw,
    hasDeposit,
    hasPendingDeposit,
    hasPendingWithdraw,
    hasReadyWithdraw,
    isWithdrawDisabled,
    handleTopUpPress,
    handleWithdrawalPress,
    handleConfirmWithdrawalPress,
  } = usePoolInfo(pool, poolStakingInfo);

  const hasAnyBalance = hasDeposit || hasPendingDeposit;

  const handleSendPress = useCallback(() => {
    if (!stakingJetton) {
      return;
    }

    trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.StakingPoolDetails });
    openSend({
      currency: stakingJetton.jettonAddress,
      isJetton: true,
      from: SendAnalyticsFrom.StakingPoolDetails,
    });
  }, [stakingJetton]);

  const handleLiquidityTokenPress = useCallback(() => {
    openDAppBrowser(LIQUIDITY_TOKEN_URL);
  }, []);

  const links = useMemo(() => {
    const list: IStakingLink[] = [];

    if (provider.url) {
      list.push({
        url: provider.url,
        type: StakingLinkType.Website,
        icon: getLinkIcon(StakingLinkType.Website),
      });
    }

    if (provider.socials) {
      list.push(
        ...provider.socials
          .map((url): IStakingLink => {
            const linkType = getSocialLinkType(url);

            return { url, type: linkType, icon: getLinkIcon(linkType), social: true };
          })
          .sort((a, b) => {
            const linkTypes = Object.values(StakingLinkType);

            return linkTypes.indexOf(a.type) > linkTypes.indexOf(b.type) ? 1 : -1;
          }),
      );
    }

    list.push({
      url: getServerConfig('accountExplorer').replace('%s', pool.address),
      type: StakingLinkType.Explorer,
      icon: getLinkIcon(StakingLinkType.Explorer),
    });

    return list;
  }, [pool.address, provider.socials, provider.url]);

  const handleLinkPress = useCallback(
    (link: IStakingLink) => async () => {
      if (link.social) {
        try {
          await Linking.openURL(link.url);

          return;
        } catch {}
      }

      openDAppBrowser(link.url);
    },
    [],
  );

  const isImplemeted = KNOWN_STAKING_IMPLEMENTATIONS.includes(pool.implementation);

  const isLiquidTF = pool.implementation === PoolImplementationType.LiquidTF;

  return (
    <S.Wrap>
      <ScrollHandler
        isLargeNavBar={false}
        navBarTitle={pool.name}
        navBarSubtitle={isLiquidTF && tonstakersBeta ? 'Beta' : undefined}
      >
        <Animated.ScrollView
          refreshControl={<RefreshControl {...refreshControl} />}
          showsVerticalScrollIndicator={false}
        >
          <S.Content>
            <S.HeaderWrap>
              <S.FlexRow>
                <S.JettonAmountWrapper>
                  <HideableAmount variant="h2">
                    {stakingFormatter.format(
                      stakingJetton ? balance.totalTon : balance.amount,
                    )}{' '}
                    TON
                  </HideableAmount>
                  <Spacer y={2} />
                  <HideableAmount variant="body2" color="foregroundSecondary">
                    {formatter.format(balance.totalFiat, { currency: fiatCurrency })}
                    {stakingJetton ? (
                      <>
                        <Text color="textTertiary"> · </Text>
                        {stakingFormatter.format(balance.amount)} {balance.symbol}
                      </>
                    ) : null}
                  </HideableAmount>
                </S.JettonAmountWrapper>
                <Spacer x={16} />
                <StakedTonIcon size="medium" pool={pool} />
              </S.FlexRow>
              <S.Divider />
              <Spacer y={16} />
              <S.ActionsContainer>
                <IconButton
                  onPress={handleTopUpPress}
                  iconName="ic-plus-28"
                  title={t('staking.top_up')}
                  disabled={!isImplemeted}
                />
                <IconButton
                  onPress={handleWithdrawalPress}
                  iconName="ic-arrow-down-28"
                  title={t('staking.withdraw')}
                  disabled={!isImplemeted || isWithdrawDisabled}
                />
                {!!stakingJetton && hasDeposit ? (
                  <IconButton
                    onPress={handleSendPress}
                    iconName="ic-arrow-up-28"
                    title={t('wallet_send')}
                  />
                ) : null}
              </S.ActionsContainer>
              <S.Divider />
            </S.HeaderWrap>
            {hasPendingDeposit ? (
              <>
                <Spacer y={16} />
                <S.BalanceContainer>
                  <Text variant="label1">{t('staking.details.pendingDeposit')}</Text>
                  <S.BalanceRight>
                    <HideableAmount variant="label1">
                      {stakingFormatter.format(pendingDeposit.amount)} TON
                    </HideableAmount>
                    <HideableAmount variant="body2" color="foregroundSecondary">
                      {pendingDeposit.formatted.totalFiat}
                    </HideableAmount>
                  </S.BalanceRight>
                </S.BalanceContainer>
              </>
            ) : null}
            {hasPendingWithdraw ? (
              <>
                <Spacer y={16} />
                <S.BalanceContainer>
                  <S.Column>
                    <Text variant="label1">{t('staking.details.pendingWithdraw')}</Text>
                    <Text variant="body2" color="foregroundSecondary">
                      {t('staking.details.pendingWithdrawDesc')}
                    </Text>
                  </S.Column>
                  <S.BalanceRight>
                    <HideableAmount variant="label1">
                      {stakingFormatter.format(pendingWithdraw.amount)} TON
                    </HideableAmount>
                    <HideableAmount variant="body2" color="foregroundSecondary">
                      {pendingWithdraw.formatted.totalFiat}
                    </HideableAmount>
                  </S.BalanceRight>
                </S.BalanceContainer>
              </>
            ) : null}
            {hasReadyWithdraw ? (
              <>
                <Spacer y={16} />
                <S.BalanceTouchableContainer>
                  <S.BalanceTouchable
                    onPress={handleConfirmWithdrawalPress}
                    isDisabled={!isImplemeted}
                  >
                    <S.BalanceTouchableContent>
                      <S.Flex>
                        <Text variant="label1">{t('staking.details.readyWithdraw')}</Text>
                        <Text variant="body2" color="foregroundSecondary">
                          {t('staking.details.tap_to_collect')}
                        </Text>
                      </S.Flex>
                      <S.BalanceRight>
                        <HideableAmount variant="label1">
                          {stakingFormatter.format(readyWithdraw.amount)} TON
                        </HideableAmount>
                        <HideableAmount variant="body2" color="foregroundSecondary">
                          {readyWithdraw.formatted.totalFiat}
                        </HideableAmount>
                      </S.BalanceRight>
                    </S.BalanceTouchableContent>
                  </S.BalanceTouchable>
                </S.BalanceTouchableContainer>
              </>
            ) : null}
            {hasAnyBalance ? (
              <>
                <Spacer y={16} />
                <NextCycle pool={pool} reward={true} />
                {/* {stakingJetton && isLiquidTF ? (
                  <>
                    <Spacer y={24} />
                    <S.ChartContainer>
                      <StakingChart stakingJetton={stakingJetton} />
                    </S.ChartContainer>
                  </>
                ) : null} */}
              </>
            ) : null}
            <Spacer y={8} />
            <S.TitleContainer>
              <Text variant="h3">{t('staking.details.about_pool')}</Text>
            </S.TitleContainer>
            <S.Table>
              {infoRows.map((item) => [
                <React.Fragment key={item.label}>
                  <Highlight onPress={item.onPress} isDisabled={!item.onPress}>
                    <S.Item>
                      <S.Row>
                        <S.ItemLabel numberOfLines={1}>{item.label}</S.ItemLabel>
                        {item.tags?.map((tag) => (
                          <Tag key={tag.title} type={tag.type}>
                            {tag.title}
                          </Tag>
                        ))}
                      </S.Row>
                      <S.ItemValue>{item.value}</S.ItemValue>
                    </S.Item>
                  </Highlight>
                </React.Fragment>,
              ])}
              {stakingJetton && isLiquidTF ? (
                <S.Item>
                  <S.Row>
                    <S.ItemLabel numberOfLines={1}>
                      {t('staking.details.liquidity_token.label', {
                        token: stakingJetton.metadata.symbol,
                      })}
                    </S.ItemLabel>
                  </S.Row>
                  <TouchableOpacity
                    activeOpacity={Opacity.ForSmall}
                    onPress={handleLiquidityTokenPress}
                  >
                    <S.ItemValue color="accentPrimary">
                      {t('staking.details.liquidity_token.value')}
                    </S.ItemValue>
                  </TouchableOpacity>
                </S.Item>
              ) : null}
            </S.Table>
            <Spacer y={12} />
            <Text variant="body3" color="foregroundTertiary">
              {t('staking.details.note')}
            </Text>
            <Spacer y={8} />
            <S.TitleContainer>
              <Text variant="h3">{t('staking.details.links_title')}</Text>
            </S.TitleContainer>
            <S.ExploreButtons>
              {links.map((link) => (
                <Button
                  onPress={handleLinkPress(link)}
                  key={link.url}
                  before={
                    link.icon ? (
                      <>
                        <Icon
                          name={link.icon}
                          color="iconPrimary"
                          style={{ marginRight: 8 }}
                        />
                      </>
                    ) : undefined
                  }
                  style={{ marginRight: 8, marginBottom: 8 }}
                  mode="secondary"
                  size="medium_rounded"
                >
                  {getLinkTitle(link)}
                </Button>
              ))}
            </S.ExploreButtons>
            <Spacer y={16} />
            <SafeAreaView edges={['bottom']} />
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
