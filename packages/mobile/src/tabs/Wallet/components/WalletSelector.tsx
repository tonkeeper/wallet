import { useWallet } from '@tonkeeper/shared/hooks';
import {
  Flash,
  Haptics,
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  deviceWidth,
  getWalletColorHex,
  isAndroid,
} from '@tonkeeper/uikit';
import React, { FC, memo, useCallback } from 'react';
import { Text as RNText } from 'react-native';
import { useNavigation } from '@tonkeeper/router';
import { FlashCountKeys, useFlashCount } from '$store';
import { tk } from '$wallet';

const WalletSelectorComponent: FC = () => {
  const wallet = useWallet();
  const nav = useNavigation();
  const [flashShownCount, disableFlash] = useFlashCount(FlashCountKeys.MultiWallet);

  const handlePress = useCallback(() => {
    disableFlash();
    Haptics.selection();
    nav.openModal('/switch-wallet');
  }, [disableFlash, nav]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <Flash
          style={[
            styles.selectorContainer.static,
            { backgroundColor: getWalletColorHex(wallet.config.color) },
          ]}
          disabled={!tk.migrationData || flashShownCount >= 3}
        >
          <RNText style={styles.emoji.static}>{wallet.config.emoji}</RNText>
          <Spacer x={4} />
          <View style={styles.nameContainer}>
            <Text type="label2" numberOfLines={1}>
              {wallet.config.name}
            </Text>
          </View>
          <Spacer x={6} />
          <Icon name="ic-chevron-down-16" style={styles.icon.static} />
        </Flash>
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
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nameContainer: {
    maxWidth: deviceWidth - 180,
  },
  icon: {
    opacity: 0.64,
  },
  emoji: {
    fontSize: isAndroid ? 17 : 20,
    marginTop: isAndroid ? -1 : 1,
  },
});
