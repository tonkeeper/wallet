import React, { memo } from 'react';
import { Screen, View, ListSeparator, AssetCell } from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { RefreshControl } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { CellItemToRender } from '../content-providers/utils/types';

interface WalletContentListProps {
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
  const theme = useTheme();

  return (
    <Screen.FlashList
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListHeaderComponent={props.ListHeaderComponent}
      ListFooterComponent={props.ListFooterComponent}
      renderItem={AssetCell}
      data={props.walletContent}
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.isRefreshing && props.isFocused}
          tintColor={theme.colors.foregroundPrimary}
          progressBackgroundColor={theme.colors.foregroundPrimary}
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
