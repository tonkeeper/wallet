import { useWallet } from '@tonkeeper/shared/hooks';
import {
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  deviceWidth,
} from '@tonkeeper/uikit';
import React, { FC, memo, useCallback } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';

const WalletSelectorComponent: FC = () => {
  const wallet = useWallet();
  const nav = useNavigation();
  const dispatch = useDispatch();

  const handlePress = useCallback(() => {
    dispatch(walletActions.clearGeneratedVault());
    nav.openModal('/switch-wallet');
  }, [dispatch, nav]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <View
          style={[styles.selectorContainer, { backgroundColor: wallet.config.color }]}
        >
          <View style={styles.nameContainer}>
            <Text type="label2" numberOfLines={1}>
              {wallet.config.name}
            </Text>
          </View>
          <Spacer x={6} />
          <Icon name="ic-chevron-down-16" style={styles.icon.static} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const WalletSelector = memo(WalletSelectorComponent);

const styles = Steezy.create({
  container: { alignItems: 'center' },
  selectorContainer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 20,
  },
  nameContainer: {
    maxWidth: deviceWidth - 180,
  },
  icon: {
    opacity: 0.64,
  },
});
