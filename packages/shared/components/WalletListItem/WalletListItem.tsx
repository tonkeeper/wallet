import { Tag } from '@tonkeeper/mobile/src/uikit';
import { Wallet } from '@tonkeeper/mobile/src/wallet/Wallet';
import {
  List,
  Steezy,
  Text,
  View,
  deviceWidth,
  getWalletColorHex,
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

  return (
    <List.Item
      title={
        <View style={styles.titleContainer}>
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
    maxWidth: deviceWidth - 240,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginTop: 2,
  },
}));
