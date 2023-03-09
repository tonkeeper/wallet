import { useFiatValue, useTranslator } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { AppStackRouteNames, MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import { BottomButtonWrap, BottomButtonWrapHelper, NextCycle } from '$shared/components';
import { CryptoCurrencies } from '$shared/constants';
import { Button, ScrollHandler, Separator, Spacer, Text } from '$uikit';
import { RouteProp } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo, useState } from 'react';
import Animated from 'react-native-reanimated';
import * as S from './StakingPoolDetails.style';
import { PoolDetailsItem } from './types';

const nextCycleTimestamp = Date.now() / 1000 + 3600 * 11;

interface Props {
  route: RouteProp<MainStackParamList, MainStackRouteNames.StakingPoolDetails>;
}

export const StakingPoolDetails: FC<Props> = (props) => {
  const {
    route: {
      params: { poolAddress },
    },
  } = props;

  const t = useTranslator();

  const nav = useNavigation();

  const poolName = 'Tonkeeper #1';

  const hasDeposit = poolAddress === 'poolAddress2';

  const balance = useFiatValue(CryptoCurrencies.Ton, hasDeposit ? '100' : '0');

  const pending = useFiatValue(CryptoCurrencies.Ton, hasDeposit ? '0' : '400');

  const hasPending = new BigNumber(pending.amount).isGreaterThan(0);

  const [detailsVisible, setDetailsVisible] = useState(!hasDeposit);

  const frequency = 36;
  const apy = 6.79608;
  const minDeposit = '50';
  const poolFee = 30;
  const depositFee = '0.2';
  const withdrawalRequestFee = '0.2';
  const withdrawalCompleteFee = '0.2';

  const handleTopUpPress = useCallback(() => {
    nav.push(AppStackRouteNames.StakingSend, { isWithdrawal: false });
  }, [nav]);

  const handleWithdrawalPress = useCallback(() => {
    nav.push(AppStackRouteNames.StakingSend, { isWithdrawal: true });
  }, [nav]);

  const handleDetailsButtonPress = useCallback(() => setDetailsVisible(true), []);

  const infoRows = useMemo(() => {
    const rows: PoolDetailsItem[] = [];

    if (apy) {
      rows.push({
        label: t('staking.details.apy.label'),
        value: t('staking.details.apy.value', { value: apy.toFixed(2) }),
      });
    }

    if (frequency) {
      rows.push({
        label: t('staking.details.frequency.label'),
        value: t('staking.details.frequency.value', { value: frequency }),
      });
    }

    if (minDeposit) {
      rows.push({
        label: t('staking.details.min_deposit.label'),
        value: t('staking.details.min_deposit.value', { value: minDeposit }),
      });
    }

    if (poolFee) {
      rows.push({
        label: t('staking.details.pool_fee.label'),
        value: t('staking.details.pool_fee.value', { value: poolFee }),
      });
    }

    if (depositFee) {
      rows.push({
        label: t('staking.details.deposit_fee.label'),
        value: t('staking.details.deposit_fee.value', { value: depositFee }),
      });
    }

    if (withdrawalRequestFee) {
      rows.push({
        label: t('staking.details.withdrawal_request_fee.label'),
        value: t('staking.details.withdrawal_request_fee.value', {
          value: withdrawalRequestFee,
        }),
      });
    }

    if (withdrawalCompleteFee) {
      rows.push({
        label: t('staking.details.withdrawal_complete_fee.label'),
        value: t('staking.details.withdrawal_complete_fee.value', {
          value: withdrawalCompleteFee,
        }),
      });
    }

    return rows;
  }, [t]);

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={poolName}>
        <Animated.ScrollView showsVerticalScrollIndicator={false}>
          <S.Content>
            <S.BalanceContainer>
              <Text variant="label1">{t('staking.details.balance')}</Text>
              <S.BalanceRight>
                <Text variant="label1">{balance.amount} TON</Text>
                <Text variant="body2" color="foregroundSecondary">
                  {balance.fiatInfo.amount}
                </Text>
              </S.BalanceRight>
            </S.BalanceContainer>
            <Spacer y={16} />
            {hasPending ? (
              <>
                <S.BalanceContainer>
                  <Text variant="label1">{t('staking.details.pending')}</Text>
                  <S.BalanceRight>
                    <Text variant="label1">{pending.amount} TON</Text>
                    <Text variant="body2" color="foregroundSecondary">
                      {pending.fiatInfo.amount}
                    </Text>
                  </S.BalanceRight>
                </S.BalanceContainer>
                <Spacer y={16} />
              </>
            ) : null}
            <NextCycle timestamp={nextCycleTimestamp} frequency={36} />
            <Spacer y={16} />
            {detailsVisible ? (
              <>
                <S.TitleContainer>
                  <Text variant="label1">{t('staking.details.about_pool')}</Text>
                </S.TitleContainer>
                <S.Table>
                  {infoRows.map((item, i) => [
                    <React.Fragment key={item.label}>
                      {i > 0 ? <Separator /> : null}
                      <S.Item>
                        <S.ItemLabel numberOfLines={1}>{item.label}</S.ItemLabel>
                        <S.ItemValue>{item.value}</S.ItemValue>
                      </S.Item>
                    </React.Fragment>,
                  ])}
                </S.Table>
              </>
            ) : (
              <S.DetailsButtonContainer>
                <Button mode="secondary" size="small" onPress={handleDetailsButtonPress}>
                  {t('staking.details.show_details')}
                </Button>
              </S.DetailsButtonContainer>
            )}
            <Spacer y={16} />
          </S.Content>
          <BottomButtonWrapHelper />
        </Animated.ScrollView>
      </ScrollHandler>
      <BottomButtonWrap>
        <S.Row>
          {hasDeposit ? (
            <>
              <S.Flex>
                <Button onPress={handleWithdrawalPress} mode="secondary">
                  {t('staking.withdraw')}
                </Button>
              </S.Flex>
              <Spacer x={16} />
            </>
          ) : null}
          <S.Flex>
            <Button onPress={handleTopUpPress}>{t('staking.top_up')}</Button>
          </S.Flex>
        </S.Row>
      </BottomButtonWrap>
    </S.Wrap>
  );
};
