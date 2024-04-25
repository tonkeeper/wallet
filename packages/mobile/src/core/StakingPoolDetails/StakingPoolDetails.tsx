import { usePoolInfo } from '$hooks/usePoolInfo';
import { useStakingRefreshControl } from '$hooks/useStakingRefreshControl';
import { MainStackRouteNames, openDAppBrowser, openJetton } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import {
  getStakingPoolByAddress,
  getStakingProviderById,
} from '@tonkeeper/shared/utils/staking';
import {
  Button,
  Highlight,
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
import * as S from './StakingPoolDetails.style';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { t } from '@tonkeeper/shared/i18n';
import { useFlag } from '$utils/flags';
import { formatter } from '@tonkeeper/shared/formatter';
import { IStakingLink, StakingLinkType } from './types';
import { ActionButtons, Icon, List, Steezy } from '@tonkeeper/uikit';
import { getLinkIcon, getLinkTitle, getSocialLinkType } from './utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { ListItemRate } from '../../tabs/Wallet/components/ListItemRate';
import { useStakingState, useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { StakingManager } from '$wallet/managers/StakingManager';
import { config } from '$config';
import { tk } from '$wallet';

interface Props {
  route: RouteProp<MainStackParamList, MainStackRouteNames.StakingPoolDetails>;
}

export const StakingPoolDetails: FC<Props> = (props) => {
  const {
    route: {
      params: { poolAddress },
    },
  } = props;

  const fiatCurrency = useWalletCurrency();

  const tonstakersBeta = useFlag('tonstakers_beta');

  const pool = useStakingState(
    (s) => getStakingPoolByAddress(s, poolAddress),
    [poolAddress],
  );
  const poolStakingInfo = useStakingState(
    (s) => s.stakingInfo[pool.address],
    [pool.address],
  );
  const provider = useStakingState(
    (s) => getStakingProviderById(s, pool.implementation),
    [pool.implementation],
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
    stakingJettonMetadata,
    handleTopUpPress,
    handleWithdrawalPress,
    handleConfirmWithdrawalPress,
  } = usePoolInfo(pool, poolStakingInfo);

  const hasAnyBalance = hasDeposit || hasPendingDeposit;

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
      url: config.get('accountExplorer', tk.wallet.isTestnet).replace('%s', pool.address),
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

  const handlePressJetton = useCallback(() => {
    if (!stakingJetton) {
      return;
    }

    openJetton(stakingJetton.jettonAddress);
  }, [stakingJetton]);

  const isImplemeted = StakingManager.KNOWN_STAKING_IMPLEMENTATIONS.includes(
    pool.implementation,
  );

  const isLiquidTF = pool.implementation === PoolImplementationType.LiquidTF;

  const stakingJettonView = useMemo(
    () =>
      stakingJettonMetadata ? (
        <>
          <List indent={false} style={styles.list}>
            <List.Item
              onPress={stakingJetton ? handlePressJetton : undefined}
              title={stakingJettonMetadata.symbol}
              picture={stakingJettonMetadata.image}
              value={
                <HideableAmount
                  style={styles.valueText.static}
                  variant="label1"
                  stars=" * * *"
                >{` ${formatter.format(stakingJettonMetadata.price.amount, {
                  decimals: Number(stakingJettonMetadata.decimals),
                })}`}</HideableAmount>
              }
              subvalue={
                <HideableAmount
                  style={styles.subvalueText.static}
                  variant="body2"
                  color="textSecondary"
                >
                  {formatter.format(stakingJettonMetadata.price.totalFiat, {
                    currency: fiatCurrency,
                  })}
                </HideableAmount>
              }
              subtitle={
                <ListItemRate
                  percent={stakingJettonMetadata.price.fiatDiff.percent}
                  price={stakingJettonMetadata.price.formatted.fiat ?? ''}
                  trend={stakingJettonMetadata.price.fiatDiff.trend}
                />
              }
            />
          </List>
          <Spacer y={12} />
          <Text variant="body3" color="foregroundTertiary">
            {t('staking.jetton_note', {
              poolName: pool.name,
              token: stakingJettonMetadata.symbol,
            })}
          </Text>
        </>
      ) : null,
    [fiatCurrency, handlePressJetton, pool.name, stakingJetton, stakingJettonMetadata],
  );

  const wallet = useWallet();
  const isWatchOnly = wallet && wallet.isWatchOnly;

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
                  </HideableAmount>
                </S.JettonAmountWrapper>
                <Spacer x={16} />
                <StakedTonIcon size="medium" pool={pool} />
              </S.FlexRow>
              <ActionButtons
                buttons={[
                  {
                    id: 'top-up',
                    disabled: isWatchOnly || !isImplemeted,
                    onPress: handleTopUpPress,
                    icon: 'ic-plus-outline-28',
                    title: t('staking.top_up'),
                  },
                  {
                    id: 'withdraw',
                    onPress: handleWithdrawalPress,
                    icon: 'ic-minus-outline-28',
                    title: t('staking.withdraw'),
                    disabled: isWatchOnly || !isImplemeted || isWithdrawDisabled,
                  },
                ]}
              />
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
            <Spacer y={8} />
            {stakingJettonMetadata && hasAnyBalance ? (
              <>
                {stakingJettonView}
                <Spacer y={24} />
              </>
            ) : null}
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
            </S.Table>
            <Spacer y={12} />
            <Text variant="body3" color="foregroundTertiary">
              {t('staking.details.note')}
            </Text>
            {stakingJettonMetadata && !hasAnyBalance ? (
              <>
                <Spacer y={16} />
                <Spacer y={8} />
                {stakingJettonView}
                <Spacer y={16} />
              </>
            ) : (
              <Spacer y={8} />
            )}
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

const styles = Steezy.create(({ colors }) => ({
  valueText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  list: {
    marginBottom: 0,
  },
}));
