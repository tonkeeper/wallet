import React, { memo, useCallback, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Screen, Spacer, SpacerSizes, View, List, PagerView } from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { openJetton } from '$navigation';
import { walletActions } from '$store/wallet';
import { Rate } from '../hooks/useBalance';
import { ListItemRate } from './ListItemRate';
import { TonIcon, TonIconProps } from '@tonkeeper/uikit';
import { CryptoCurrencies, LockupNames } from '$shared/constants';
import { NFTsList } from './NFTsList';
import { TokenPrice, useTokenPrice } from '$hooks/useTokenPrice';
import { useTheme } from '$hooks/useTheme';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { StakingWidget } from './StakingWidget';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { TronBalance } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';
import { fiatCurrencySelector } from '$store/main';
import { FiatCurrencies } from '@tonkeeper/core';

enum ContentType {
  Token,
  Collectibles,
  Spacer,
  NFTCardsRow,
  Staking,
}

type TokenItem = {
  type: ContentType.Token;
  key: string;
  isFirst?: boolean;
  isLast?: boolean;

  onPress?: () => void;
  title: string;
  subtitle?: string;
  value?: string;
  subvalue?: string;
  rate?: Rate;
  picture?: string;
  tonIcon?: boolean | TonIconProps;
  label?: string;
};

type SpacerItem = {
  key: string;
  type: ContentType.Spacer;
  bottom: SpacerSizes;
};

type NFTCardsRowItem = {
  key: string;
  type: ContentType.NFTCardsRow;
  items: any; // TODO:
};

type StakingItem = {
  key: string;
  type: ContentType.Staking;
};

type Content = TokenItem | SpacerItem | NFTCardsRowItem | StakingItem;

const RenderItem = ({ item }: { item: Content }) => {
  switch (item.type) {
    case ContentType.Token:
      const renderLeftContent = () => {
        if (typeof item.tonIcon === 'object') {
          return <TonIcon {...item.tonIcon} />;
        } else if (typeof item.tonIcon === 'boolean') {
          return <TonIcon showDiamond />;
        }
      };

      const containerStyle = [
        item.isFirst && styles.firstListItem,
        item.isLast && styles.lastListItem,
        styles.containerListItem,
      ];

      return (
        <View style={containerStyle}>
          <List.Item
            leftContent={renderLeftContent()}
            onPress={item.onPress}
            title={item.title}
            picture={item.picture}
            value={
              <HideableAmount
                style={styles.valueText.static}
                variant="label1"
                stars=" * * *"
              >{` ${item.value}`}</HideableAmount>
            }
            label={item.label}
            subvalue={
              item.subvalue && (
                <HideableAmount
                  style={styles.subvalueText.static}
                  variant="body2"
                  color="textSecondary"
                >
                  {item.subvalue}
                </HideableAmount>
              )
            }
            subtitle={
              item.rate ? (
                <ListItemRate
                  percent={item.rate.percent}
                  price={item.rate.price}
                  trend={item.rate.trend}
                />
              ) : (
                item.subtitle
              )
            }
          />
          {!item.isLast && <ListSeparator />}
        </View>
      );
    case ContentType.Spacer:
      return <Spacer y={item.bottom} />;
    case ContentType.NFTCardsRow:
      return <NFTsList nfts={item.items} />;
    case ContentType.Staking:
      return <StakingWidget />;
  }
};

interface BalancesListProps {
  tokens: any; // TODO:
  balance: any; // TODO:
  tonPrice: TokenPrice;
  nfts?: any; // TODO:
  tronBalances?: TronBalance[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFocused: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const WalletContentList = memo<BalancesListProps>(
  ({
    tokens,
    balance,
    tonPrice,
    nfts,
    handleRefresh,
    isRefreshing,
    isFocused,
    ListHeaderComponent,
    tronBalances,
  }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const fiatCurrency = useSelector(fiatCurrencySelector);
    const shouldShowTonDiff = fiatCurrency !== FiatCurrencies.Ton;

    const handleMigrate = useCallback(
      (fromVersion: string) => () => {
        dispatch(
          walletActions.openMigration({
            isTransfer: true,
            fromVersion,
          }),
        );
      },
      [dispatch],
    );

    const data = useMemo(() => {
      const content: Content[] = [];

      // Tokens
      content.push({
        type: ContentType.Token,
        key: 'ton',
        title: 'Toncoin',
        onPress: () => openWallet(CryptoCurrencies.Ton),
        value: balance.ton.amount.formatted,
        subvalue: balance.ton.amount.fiat,
        tonIcon: true,
        rate: {
          percent: shouldShowTonDiff ? tonPrice.fiatDiff.percent : '',
          price: tonPrice.formatted.fiat ?? '-',
          trend: tonPrice.fiatDiff.trend,
        },
      });

      content.push(
        ...balance.oldVersions.map((item) => ({
          type: ContentType.Token,
          key: 'old_' + item.version,
          onPress: handleMigrate(item.version),
          title: t('wallet.old_wallet_title'),
          tonIcon: { transparent: true },
          value: item.amount.formatted,
          subvalue: item.amount.fiat,
          rate: {
            percent: shouldShowTonDiff ? tonPrice.fiatDiff.percent : '',
            price: tonPrice.formatted.fiat ?? '-',
            trend: tonPrice.fiatDiff.trend,
          },
        })),
      );

      if (balance.lockup.length > 0) {
        content.push(
          ...balance.lockup.map((item) => ({
            type: ContentType.Token,
            tonIcon: { locked: true },
            title: LockupNames[item.type],
            value: item.amount.formatted,
            subvalue: item.amount.fiat,
            subtitle: tonPrice.formatted.fiat ?? '-',
          })),
        );
      }

      // if (tronBalances && tronBalances.length > 0) {
      //   content.push(
      //     ...(tronBalances as any).map((item) => {
      //       const amount = formatter.fromNano(item.weiAmount, item.token.decimals);
      //       const fiatAmount = formatter.format(usdtRate.fiat * parseFloat(amount), {
      //         currency: fiatCurrency
      //       });
      //       const fiatPrice = formatter.format(usdtRate.fiat, {
      //         currency: fiatCurrency
      //       });

      //       return {
      //         onPress: () => openTronToken(item),
      //         type: ContentType.Token,
      //         picture: item.token.image,
      //         title: (
      //           <View style={styles.trcTitle}>
      //             <Text type="label1">{item.token.symbol}</Text>
      //             <View style={styles.trcLabel}>
      //               <Text type="body4" color="textSecondary">
      //                 TRC20
      //               </Text>
      //             </View>
      //           </View>
      //         ),
      //         value: amount,
      //         subvalue: fiatAmount,
      //         subtitle: fiatPrice,
      //       };
      //     }),
      //   );
      // }

      content.push({
        key: 'staking',
        type: ContentType.Staking,
      });

      content.push({
        key: 'spacer_staking',
        type: ContentType.Spacer,
        bottom: 32,
      });

      content.push(
        ...tokens.list.map((item, index) => ({
          key: 'token_' + item.address.rawAddress,
          isFirst: index === 0,
          type: ContentType.Token,
          onPress: () => openJetton(item.address.rawAddress),
          picture: item.iconUrl,
          title: item.symbol,
          value: item.quantity.formatted,
          subvalue: item.rate.total,
          rate: item.rate.price
            ? {
                price: item.rate.price,
                percent: item.price.fiatDiff.percent,
                trend: item.price.fiatDiff.trend,
              }
            : undefined,
        })),
      );

      const firstTonkenElement = content[0] as TokenItem;
      const lastTokenElement = content[content.length - 1] as TokenItem;

      if (tokens.list.length > 0) {
        content.push({
          key: 'spacer_nft',
          type: ContentType.Spacer,
          bottom: 32,
        });
      }

      // Make list; set corners
      firstTonkenElement.isFirst = true;
      lastTokenElement.isLast = true;

      if (nfts) {
        const numColumns = 3;
        for (let i = 0; i < Math.ceil(nfts.length / numColumns); i++) {
          content.push({
            key: 'nft_' + i,
            type: ContentType.NFTCardsRow,
            items: nfts.slice(i * numColumns, i * numColumns + numColumns),
          });
        }
      }

      content.push({
        key: 'spacer_bottom',
        type: ContentType.Spacer,
        bottom: 12,
      });

      return content;
    }, [balance, handleMigrate, nfts, tokens.list, tonPrice, tronBalances]);

    const ListComponent = nfts ? Screen.FlashList : PagerView.FlatList;

    return (
      <ListComponent
        ListHeaderComponent={ListHeaderComponent}
        renderItem={RenderItem}
        data={data}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing && isFocused}
            tintColor={theme.colors.foregroundPrimary}
            progressBackgroundColor={theme.colors.foregroundPrimary}
          />
        }
      />
    );
  },
);

const styles = Steezy.create(({ colors, corners }) => ({
  trcTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trcLabel: {
    backgroundColor: colors.backgroundContentTint,
    paddingHorizontal: 5,
    paddingTop: 2.5,
    paddingBottom: 3.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  firstListItem: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  lastListItem: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
  valueText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },

  container: {
    position: 'relative',
  },
  mainSection: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  amount: {
    paddingTop: 29,
    alignItems: 'center',
    marginBottom: 24.5,
  },
  addressText: {
    marginTop: 7.5,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
}));
