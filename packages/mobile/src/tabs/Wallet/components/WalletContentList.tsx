import { Screen, List, PagerView, ListItem, TonIcon } from '@tonkeeper/uikit';
import { JettonBalance } from '@tonkeeper/core/src/TonAPI';
import { TokenPrice } from '$hooks/useTokenPrice';
import { StakingWidget } from './StakingWidget';
import { RefreshControl, StyleSheet } from 'react-native';
import { memo, useMemo } from 'react';

import { JettonBalanceItem } from '@tonkeeper/shared/components/WalletContentList/items/JettonBalanceItem';
import { ListItemRate } from '@tonkeeper/shared/components/WalletContentList/components/ListItemRate';
import { useTonPrice } from '@tonkeeper/shared/hooks/useTonPrice';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { CryptoCurrencies } from '$shared/constants';

import { useTonBalance } from '@tonkeeper/shared/hooks/useTonBalance';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import { useCurrency } from '@tonkeeper/shared/hooks/useCurrency';
import { TronBalance } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';
import { fiatCurrencySelector } from '$store/main';
import { FiatCurrencies } from '@tonkeeper/core';

enum ContentType {
  FirstBlock = 'FirstBlock',
  TonBalance = 'TonBalance',
  TonOldBalance = 'TonOldBalance',
  TonLockupBalance = 'TonLockupBalance',
  JettonBalances = 'JettonBalances',
  NftItemsRow = 'NftItemsRow',
  Staking = 'Staking',
}

export type ContentPayload = {
  [ContentType.FirstBlock]: AnyContentItem;
  [ContentType.TonBalance]: {};
  [ContentType.TonOldBalance]: {};
  [ContentType.TonLockupBalance]: {};
  [ContentType.JettonBalances]: JettonBalance;
  [ContentType.NftItemsRow]: {};
  [ContentType.Staking]: {};
};

export type AnyContentPayload = ContentPayload[keyof ContentPayload];

type ContentItem<T extends ContentType = ContentType> = {
  payload: ContentPayload[T];
  isFirstItem: boolean;
  isLastBlock: boolean;
  isLastItem: boolean;
  type: T;
};

export type AnyContentItem<T extends ContentType = ContentType> = T extends T
  ? ContentItem<T>
  : never;

const TonBalanceItem = () => {
  const tonBalance = useTonBalance();
  const tonPrice = useTonPrice();
  const currency = useCurrency();

  const fiatBalance = useMemo(() => {
    return new BigNumber(formatter.fromNano(tonBalance)).multipliedBy(tonPrice.value);
  }, [tonBalance, tonPrice.value]);

  return (
    <ListItem
      title="Toncoin"
      leftContent={<TonIcon showDiamond />}
      subvalue={formatter.format(fiatBalance, { currency })}
      onPress={() => openWallet(CryptoCurrencies.Ton)}
      subtitle={<ListItemRate price={tonPrice} />}
      value={formatter.formatNano(tonBalance)}
    />
  );
};

const TonOldBalanceItem = () => {
  const tonBalance = useTonBalance();
  const tonPrice = useTonPrice();
  const currency = useCurrency();

  const fiatBalance = useMemo(() => {
    return new BigNumber(formatter.fromNano(tonBalance)).multipliedBy(tonPrice.value);
  }, [tonBalance, tonPrice.value]);

  //     ...balance.oldVersions.map((item) => ({
  //       type: ContentType.Token,
  //       key: 'old_' + item.version,
  //       onPress: handleMigrate(item.version),
  //       title: t('wallet.old_wallet_title'),
  //       tonIcon: { transparent: true },
  //       value: item.amount.formatted,
  //       subvalue: item.amount.fiat,
  //       rate: {
  //         percent: tonPrice.fiatDiff.percent,
  //         price: tonPrice.formatted.fiat ?? '-',
  //         trend: tonPrice.fiatDiff.trend,
  //       },
  //     })),

  return (
    <ListItem
      title="Toncoin"
      leftContent={<TonIcon showDiamond />}
      subvalue={formatter.format(fiatBalance, { currency })}
      onPress={() => openWallet(CryptoCurrencies.Ton)}
      subtitle={<ListItemRate price={tonPrice} />}
      value={formatter.formatNano(tonBalance)}
    />
  );
};

function renderFirstBlockItems(item: AnyContentItem) {
  switch (item.type) {
    case ContentType.TonBalance:
      return <TonBalanceItem />;
    case ContentType.TonOldBalance:
      // return <TonOldBalanceItem />;
      return null;
    case ContentType.TonLockupBalance:
      //     content.push(
      //       ...balance.lockup.map((item) => ({
      //         type: ContentType.Token,
      //         tonIcon: { locked: true },
      //         title: LockupNames[item.type],
      //         value: item.amount.formatted,
      //         subvalue: item.amount.fiat,
      //         subtitle: tonPrice.formatted.fiat ?? '-',
      //       })),
      //     );
      return null;
    case ContentType.Staking:
      return <StakingWidget />;
  }
}

function renderContentItems({ item }: { item: AnyContentItem }) {
  const { type, payload, isFirstItem, isLastItem, isLastBlock } = item;
  const listContainerProps = {
    ...(!isLastBlock && { endStyle: styles.blockBottomIndent }),
    isFirst: isFirstItem,
    isLast: isLastItem,
  };

  switch (type) {
    case ContentType.FirstBlock:
      return (
        <List.ItemContainer {...listContainerProps}>
          {renderFirstBlockItems(item.payload)}
        </List.ItemContainer>
      );
    case ContentType.JettonBalances:
      return (
        <List.ItemContainer {...listContainerProps}>
          <JettonBalanceItem item={payload} />
        </List.ItemContainer>
      );
    default:
      return null;
  }
}

interface BalancesListProps {
  tonPrice: TokenPrice;
  nfts?: any; // TODO:
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFocused: boolean;
  ListHeaderComponent?: React.ReactElement;
  jettons: JettonBalance[];
}

type ContentBlock = {
  type: ContentType;
  items: any[];
};

export const WalletContentList = memo<BalancesListProps>((props) => {
  const { nfts, handleRefresh, isRefreshing, ListHeaderComponent, jettons } = props;

  const data = useMemo(() => {
    const blocks: ContentBlock[] = [];
    // if (balance) {
    blocks.push({
      type: ContentType.FirstBlock,
      items: [
        {
          type: ContentType.TonBalance,
        },
        {
          type: ContentType.TonOldBalance,
        },
        {
          type: ContentType.Staking,
        },
      ],
    });
    // }

    if (jettons) {
      blocks.push({
        type: ContentType.JettonBalances,
        items: jettons,
      });
    }

    // if (nftItems) {
    //   blocks.push({
    //     type: ContentType.NftItemsRow,
    //     items: divideArray(nftItems, 3)
    //   });
    // }

    return blocks.reduce<AnyContentItem[]>((content, listItem, blockIndex) => {
      const items = listItem.items?.map((item, index) => ({
        isLastBlock: blockIndex === blocks.length - 1,
        isLastItem: index === listItem.items.length - 1,
        isFirstItem: index === 0,
        type: listItem.type,
        payload: item,
      }));

      if (items) {
        content.push(...items);
      }

      return content;
    }, []);
  }, [jettons]);

  // const ListComponent = nfts ? Screen.FlashList : PagerView.FlatList;

  return (
    <Screen.FlashList
      ListHeaderComponent={ListHeaderComponent}
      renderItem={renderContentItems}
      data={data}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    />
  );
});

const styles = StyleSheet.create({
  blockBottomIndent: {
    marginBottom: 32,
  },
});
