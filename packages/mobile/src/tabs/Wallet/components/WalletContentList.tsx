import React, { memo, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import {
  Screen,
  Spacer as SpacerView,
  SpacerSizes,
  View,
  List,
  PagerView,
  DEFAULT_TOKEN_LOGO,
} from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { RefreshControl } from 'react-native';
import { openJetton, openTonInscription } from '$navigation';
import { Rate } from '../hooks/useBalance';
import { ListItemRate } from './ListItemRate';
import { TonIcon, TonIconProps } from '@tonkeeper/uikit';
import { CryptoCurrencies, LockupNames } from '$shared/constants';
import { NFTsList } from './NFTsList';
import { TokenPrice } from '$hooks/useTokenPrice';
import { useTheme } from '$hooks/useTheme';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { StakingWidget } from './StakingWidget';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { TronBalance } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';
import { WalletCurrency } from '@tonkeeper/core';
import { formatter } from '@tonkeeper/shared/formatter';
import { Text } from '@tonkeeper/uikit';
import { JettonVerification } from '$store/models';
import { config } from '$config';
import { useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { CardsWidget } from '$components';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { ListItemProps } from '@tonkeeper/uikit/src/components/List/ListItem';
import { FinishSetupList } from './FinishSetupList';
import BigNumber from 'bignumber.js';

enum ContentType {
  Token,
  Collectibles,
  Spacer,
  NFTCardsRow,
  Staking,
  Cards,
  Setup,
}

type TokenItem = {
  type: ContentType.Token;
  key: string;
  isFirst?: boolean;
  isLast?: boolean;
  subtitleStyle?: ListItemProps['subtitleStyle'];
  onPress?: () => void;
  title: string;
  subtitle?: string;
  value?: string;
  subvalue?: string;
  rate?: Rate;
  picture?: string;
  tonIcon?: boolean | TonIconProps;
  tag?: string;
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
  isWatchOnly: boolean;
  showBuyButton: boolean;
};

type CardsItem = {
  key: string;
  type: ContentType.Cards;
};

type SetupItem = {
  key: string;
  type: ContentType.Setup;
};

type Content =
  | TokenItem
  | SpacerItem
  | NFTCardsRowItem
  | StakingItem
  | CardsItem
  | SetupItem;

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
            title={
              <View style={styles.tokenTitle}>
                <HideableAmount
                  style={styles.valueText.static}
                  variant="label1"
                  stars="* * *"
                >
                  {item.title}
                </HideableAmount>
                {!!item.tag && (
                  <View style={styles.tag}>
                    <Text type="body4" color="textSecondary">
                      {item.tag.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            }
            picture={item.picture}
            value={
              <HideableAmount
                style={styles.valueText.static}
                variant="label1"
                stars=" * * *"
              >{` ${item.value}`}</HideableAmount>
            }
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
              item.subtitle ||
              (item.rate && (
                <ListItemRate
                  percent={item.rate.percent}
                  price={item.rate.price}
                  trend={item.rate.trend}
                />
              ))
            }
            subtitleStyle={item.subtitleStyle}
          />
          {!item.isLast && <ListSeparator />}
        </View>
      );
    case ContentType.Spacer:
      return <SpacerView y={item.bottom} />;
    case ContentType.NFTCardsRow:
      return <NFTsList nfts={item.items} />;
    case ContentType.Staking:
      return (
        <StakingWidget
          isWatchOnly={item.isWatchOnly}
          showBuyButton={item.showBuyButton}
        />
      );
    case ContentType.Cards:
      return <CardsWidget />;
    case ContentType.Setup:
      return <FinishSetupList key={item.key} />;
  }
};

interface BalancesListProps {
  currency: WalletCurrency;
  tokens: any; // TODO:
  balance: any; // TODO:
  tonPrice: TokenPrice;
  nfts?: any; // TODO:
  inscriptions: InscriptionBalance[];
  tronBalances?: TronBalance[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFocused: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const WalletContentList = memo<BalancesListProps>(
  ({
    currency,
    tokens,
    balance,
    tonPrice,
    nfts,
    handleRefresh,
    isRefreshing,
    inscriptions,
    isFocused,
    ListHeaderComponent,
  }) => {
    const theme = useTheme();

    const fiatCurrency = useWalletCurrency();
    const shouldShowTonDiff = fiatCurrency !== WalletCurrency.TON;

    const wallet = useWallet();
    const isWatchOnly = wallet && wallet.isWatchOnly;
    const isLockup = wallet && wallet.isLockup;
    const identifier = wallet.identifier;
    const showStaking = isWatchOnly ? balance.staking.amount.nano !== '0' : true;
    const showBuyButton =
      !isLockup && new BigNumber(balance.ton.amount.nano).isLessThan(50);

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
        isLast: !showStaking,
      });

      if (balance.lockup.length > 0) {
        content.push(
          ...balance.lockup.map((item) => ({
            key: item.type,
            type: ContentType.Token,
            tonIcon: { locked: true },
            title: LockupNames[item.type],
            value: item.amount.formatted,
            subvalue: item.amount.fiat,
            subtitle: tonPrice.formatted.fiat ?? '-',
          })),
        );
      }

      if (showStaking) {
        content.push({
          key: 'staking',
          type: ContentType.Staking,
          isWatchOnly,
          showBuyButton,
        });
      }

      if (!isWatchOnly) {
        content.push({
          key: `setup_${identifier}`,
          type: ContentType.Setup,
        });
      }

      content.push({
        key: 'ton_section_spacer',
        type: ContentType.Spacer,
        bottom: 32,
      });

      if (!config.get('disable_holders_cards') && !isWatchOnly) {
        content.push({
          key: 'cards',
          type: ContentType.Cards,
        });
      }

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
          subtitleStyle:
            !config.get('disable_show_unverified_token') &&
            item.verification === JettonVerification.NONE &&
            styles.unverifiedSubtitleStyle,
          subtitle:
            !config.get('disable_show_unverified_token') &&
            item.verification === JettonVerification.NONE
              ? t('approval.unverified_token')
              : undefined,
        })),
      );

      if (inscriptions?.length > 0) {
        content.push(
          ...inscriptions.map((item) => ({
            key: 'inscriptions' + item.ticker,
            onPress: () => openTonInscription({ ticker: item.ticker, type: item.type }),
            type: ContentType.Token,
            tag: item.type,
            picture: DEFAULT_TOKEN_LOGO,
            title: item.ticker,
            value: formatter.formatNano(item.balance, { decimals: item.decimals }),
            subvalue: formatter.format('0', { currency, currencySeparator: 'wide' }),
            rate: {
              price: formatter.format('0', { currency, currencySeparator: 'wide' }),
            },
          })),
        );
      }

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
    }, [
      balance,
      shouldShowTonDiff,
      tonPrice,
      showStaking,
      isWatchOnly,
      tokens.list,
      inscriptions,
      nfts,
      showBuyButton,
      identifier,
      currency,
    ]);

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
  unverifiedSubtitleStyle: {
    color: colors.accentOrange,
  },
  trcTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  tokenTitle: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: colors.backgroundContentTint,
    alignSelf: 'center',
    paddingHorizontal: 5,
    paddingTop: 2.5,
    paddingBottom: 3.5,
    borderRadius: 4,
    marginLeft: 6,
  },
}));
