import { useJettonBalances } from '$hooks/useJettonBalances';
import { CryptoCurrencies, Decimals, SecondaryCryptoCurrencies } from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { walletSelector } from '$store/wallet';
import { Steezy } from '$styles';
import { Highlight, Icon, PopupSelect, Spacer, StakedTonIcon, Text, View } from '$uikit';
import { ns } from '$utils';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHideableFormatter } from '$core/HideableAmount/useHideableFormatter';
import { Platform } from 'react-native';
import { useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';
import { Address } from '@tonkeeper/core';
import { PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { t } from '@tonkeeper/shared/i18n';
import { useGetTokenPrice } from '$hooks/useTokenPrice';
import { JettonIcon, TonIcon } from '@tonkeeper/uikit';

type CoinItem =
  | { isJetton: false; currency: string; balance: string; decimals: number }
  | {
      isJetton: true;
      jetton: JettonBalanceModel;
      currency: string;
      balance: string;
      decimals: number;
      liquidStakingPool?: PoolInfo;
    };

interface Props {
  currency: string;
  currencyTitle: string;
  onChangeCurrency: (currency: string, decimals: number, isJetton: boolean) => void;
}

const CoinDropdownComponent: FC<Props> = (props) => {
  const { currency, currencyTitle, onChangeCurrency } = props;

  const { currencies, balances } = useSelector(walletSelector);

  const { enabled: jettons } = useJettonBalances();
  const { format } = useHideableFormatter();

  const stakingPools = useStakingStore((s) => s.pools, shallow);

  const getTokenPrice = useGetTokenPrice();

  const coins = useMemo((): CoinItem[] => {
    const list = [
      CryptoCurrencies.Ton,
      ...SecondaryCryptoCurrencies.filter((item) => {
        if (item === CryptoCurrencies.Ton) {
          return false;
        }

        if (+balances[item] > 0) {
          return true;
        }

        return currencies.indexOf(item) > -1;
      }),
    ].map(
      (item): CoinItem => ({
        isJetton: false,
        currency: item,
        balance: balances[item],
        decimals: Decimals[item],
      }),
    );

    return [
      ...list,
      ...jettons
        .map((jetton): CoinItem => {
          const liquidStakingPool = stakingPools.find(
            (pool) =>
              pool.liquid_jetton_master === Address.parse(jetton.jettonAddress).toRaw(),
          );

          const balance = liquidStakingPool
            ? getTokenPrice(jetton.jettonAddress, jetton.balance).totalTon.toString()
            : jetton.balance;

          return {
            isJetton: true,
            jetton: jetton,
            currency: jetton.jettonAddress,
            balance,
            decimals: jetton.metadata.decimals,
            liquidStakingPool,
          };
        })
        .sort((a, b) => {
          if (a.isJetton && a.liquidStakingPool && b.isJetton && !b.liquidStakingPool) {
            return -1;
          } else if (
            a.isJetton &&
            !a.liquidStakingPool &&
            b.isJetton &&
            b.liquidStakingPool
          ) {
            return 1;
          }

          return 0;
        }),
    ];
  }, [jettons, balances, currencies, stakingPools, getTokenPrice]);

  const selectedCoin = useMemo(
    () => coins.find((item) => item.currency === currency),
    [coins, currency],
  );

  const getTitle = useCallback((coin: CoinItem) => {
    if (coin.isJetton) {
      return coin.liquidStakingPool ? 'TON' : coin.jetton.metadata.symbol ?? '';
    }

    return coin.currency.toUpperCase();
  }, []);

  if (coins.length === 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <PopupSelect
        items={coins}
        selected={selectedCoin}
        onChange={(item) => onChangeCurrency(item.currency, item.decimals, item.isJetton)}
        keyExtractor={(item) => item.currency}
        width={ns(220)}
        maxHeight={ns(216)}
        asFullWindowOverlay
        renderItem={(item) => (
          <>
            {item.isJetton && item.liquidStakingPool ? (
              <StakedTonIcon pool={item.liquidStakingPool} size="xsmall" />
            ) : null}
            {item.isJetton && !item.liquidStakingPool ? (
              <JettonIcon size="xsmall" uri={item.jetton.metadata.image!} />
            ) : null}
            {!item.isJetton ? (
              <TonIcon
                size="xsmall"
                locked={[
                  CryptoCurrencies.TonLocked,
                  CryptoCurrencies.TonRestricted,
                ].includes(item.currency as CryptoCurrencies)}
                showDiamond
              />
            ) : null}
            <Spacer x={8} />
            <Text numberOfLines={1} style={{ width: ns(156) }}>
              <Text variant="label1">{getTitle(item)}</Text>
              {'  '}
              <Text color="foregroundSecondary">{format(item.balance)}</Text>
            </Text>
          </>
        )}
        anchor="top-center"
        top={ns(40) + ns(8)}
      >
        <Highlight background="backgroundQuaternary" useRNGHComponent>
          <View style={styles.content}>
            <Text variant="label1">
              {selectedCoin?.isJetton && selectedCoin.liquidStakingPool
                ? t('staking.staked_ton')
                : currencyTitle}
            </Text>
            <View style={styles.chevron}>
              <Icon name="ic-chevron-down-16" color="iconSecondary" />
            </View>
          </View>
        </Highlight>
      </PopupSelect>
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    borderRadius: 24,
    backgroundColor: colors.buttonTertiaryBackground,
    overflow: 'hidden',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chevron: {
    marginLeft: 6,
    marginRight: -4,
  },
}));

export const CoinDropdown = memo(CoinDropdownComponent);
