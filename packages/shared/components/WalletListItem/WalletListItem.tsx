import { Tag } from '@tonkeeper/mobile/src/uikit';
import { Wallet } from '@tonkeeper/mobile/src/wallet/Wallet';
import {
  List,
  Steezy,
  Text,
  View,
  deviceWidth,
  getWalletColorHex,
  isAndroid,
} from '@tonkeeper/uikit';
import { ListItemProps } from '@tonkeeper/uikit/src/components/List/ListItem';
import { FC, memo } from 'react';
import { Text as RNText } from 'react-native';
import { t } from '../../i18n';

interface Props extends ListItemProps {
  wallet: Wallet;
}

const WalletListItemComponent: FC<Props> = (props) => {
  const { wallet, ...listItemProps } = props;

  const titleWithTag = wallet.isTestnet || wallet.isWatchOnly;

  return (
    <List.Item
      title={
        <View style={[styles.titleContainer, titleWithTag && styles.titleWithTag]}>
          <Text type="label1" ellipsizeMode="tail" numberOfLines={1}>
            {wallet.config.name}
          </Text>
          {wallet.isTestnet ? <Tag>Testnet</Tag> : null}
          {wallet.isWatchOnly ? <Tag>{t('watch_only')}</Tag> : null}
        </View>
      }
      leftContent={
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getWalletColorHex(wallet.config.color) },
          ]}
        >
          <RNText style={styles.emoji.static}>{wallet.config.emoji}</RNText>
        </View>
      }
      {...listItemProps}
    />
  );
};

export const WalletListItem = memo(WalletListItemComponent);

const styles = Steezy.create(({ colors }) => ({
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: colors.backgroundHighlighted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWithTag: {
    maxWidth: deviceWidth - 240,
  },
  emoji: {
    fontSize: isAndroid ? 21 : 24,
    marginTop: isAndroid ? -2 : 2,
  },
}));
