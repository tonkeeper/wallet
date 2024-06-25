import React, { memo, useEffect } from 'react';
import { Screen, View, List, ListSeparator, RefreshControl } from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { ListItemRate } from './ListItemRate';
import { TonIcon } from '@tonkeeper/uikit';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Text } from '@tonkeeper/uikit';
import { CellItemToRender } from '../content-providers/utils/types';
import { FlatList } from 'react-native';

const RenderItem = ({ item }: { item: CellItemToRender }) => {
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

  const RenderComponent = item.RenderComponent;

  if (RenderComponent) {
    return (
      <View style={containerStyle}>
        <RenderComponent {...item.passProps} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <List.Item
        leftContent={renderLeftContent()}
        onPress={item.onPress}
        title={
          <View style={styles.tokenTitle}>
            <Text style={styles.valueText.static} type="label1">
              {item.title}
            </Text>
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
          typeof item.value === 'string' ? (
            <HideableAmount
              style={styles.valueText.static}
              variant="label1"
              stars=" * * *"
            >{` ${item.value}`}</HideableAmount>
          ) : (
            item.value
          )
        }
        subvalue={
          item.fiatRate && (
            <HideableAmount
              style={styles.subvalueText.static}
              variant="body2"
              color="textSecondary"
            >
              {item.fiatRate.total.formatted}
            </HideableAmount>
          )
        }
        subtitle={
          item.subtitle ||
          (item.fiatRate && (
            <ListItemRate
              percent={item.fiatRate.percent}
              price={item.fiatRate.price.formatted}
              trend={item.fiatRate.trend}
            />
          ))
        }
        subtitleStyle={item.subtitleStyle}
      />
    </View>
  );
};

interface WalletContentListProps {
  identifier: string;
  walletContent: CellItemToRender[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFocused: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement | null;
}

function ItemSeparatorComponent() {
  return (
    <View style={styles.separatorContainer}>
      <ListSeparator />
    </View>
  );
}

export const WalletContentList = memo<WalletContentListProps>((props) => {
  const listRef = React.useRef<FlatList>(null);

  useEffect(() => {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [props.identifier]);

  return (
    <Screen.FlashList
      ref={listRef}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListHeaderComponent={props.ListHeaderComponent}
      ListFooterComponent={props.ListFooterComponent}
      renderItem={RenderItem}
      data={props.walletContent}
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.isRefreshing && props.isFocused}
        />
      }
    />
  );
});

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
  separatorContainer: {
    paddingHorizontal: 16,
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
