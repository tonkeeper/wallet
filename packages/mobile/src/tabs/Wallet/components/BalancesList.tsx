import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { t } from '$translation';
import { List, Screen, Spacer, SpacerSizes, View } from '$uikit';
import { Steezy } from '$styles';
import { RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import { openJetton, openWallet } from '$navigation';
import { walletActions } from '$store/wallet';
import { Rate } from '../hooks/useBalance';
import { ListItemRate } from '../components/ListItemRate';
import { TonIcon, TonIconProps } from '../../../components/TonIcon';
import { CryptoCurrencies, LockupNames } from '$shared/constants';
import { Tabs } from '../components/Tabs';
import { NFTsList } from '../components/NFTsList';
import { TokenPrice, useTheme } from '$hooks';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { StakingWidget } from './StakingWidget';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';

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
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFocused: boolean;
  ListHeaderComponent?: React.ReactElement;
}

// See https://shopify.github.io/flash-list/docs/fundamentals/performant-components#getitemtype
export const BalancesList = memo<BalancesListProps>(
  ({
    tokens,
    balance,
    tonPrice,
    nfts,
    handleRefresh,
    isRefreshing,
    isFocused,
    ListHeaderComponent,
  }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

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
          percent: tonPrice.fiatDiff.percent,
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
            percent: tonPrice.fiatDiff.percent,
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
          title: item.name,
          value: item.quantity.formatted,
          label: item.symbol,
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

      // Make list; set corners
      firstTonkenElement.isFirst = true;
      lastTokenElement.isLast = true;

      if (nfts) {
        content.push({
          key: 'spacer_nft',
          type: ContentType.Spacer,
          bottom: 32,
        });

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
    }, [balance, handleMigrate, nfts, tokens.list, tonPrice]);

    const ListComponent = nfts ? Screen.FlashList : Tabs.FlashList;

    return (
      <ListComponent
        drawDistance={1500}
        ListHeaderComponent={ListHeaderComponent}
        getItemType={(item) => item.type}
        renderItem={RenderItem}
        estimatedItemSize={76}
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
