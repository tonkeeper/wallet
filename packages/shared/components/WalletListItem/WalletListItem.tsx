import { Tag } from '@tonkeeper/mobile/src/uikit';
import { Wallet } from '@tonkeeper/mobile/src/wallet/Wallet';
import { Icon, List, Steezy, Text, View } from '@tonkeeper/uikit';
import { ListItemProps } from '@tonkeeper/uikit/src/components/List/ListItem';
import { FC, memo } from 'react';
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
        <View style={[styles.iconContainer, { backgroundColor: wallet.config.color }]}>
          <Icon name="ic-wallet-28" />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
