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
  WalletIcon,
  deviceWidth,
  getWalletColorHex,
  isAndroid,
} from '@tonkeeper/uikit';
import React, { FC, memo, useCallback } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { FlashCountKeys, useFlashCount } from '$store';
import { tk } from '$wallet';
import { useThemeName } from '$hooks/useThemeName';

const WalletSelectorComponent: FC = () => {
  const wallet = useWallet();
  const nav = useNavigation();
  const [flashShownCount, disableFlash] = useFlashCount(FlashCountKeys.MultiWallet);
  const themeName = useThemeName();

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
            { backgroundColor: getWalletColorHex(wallet.config.color, themeName) },
          ]}
          disabled={!tk.migrationData || flashShownCount >= 3}
        >
          <WalletIcon
            emojiStyle={styles.emoji.static}
            size={20}
            value={wallet.config.emoji}
            color="constantWhite"
          />
          <Spacer x={4} />
          <View style={styles.nameContainer}>
            <Text type="label2" color="constantWhite" numberOfLines={1}>
              {wallet.config.name}
            </Text>
          </View>
          <Spacer x={6} />
          <Icon
            name="ic-chevron-down-16"
            color="constantWhite"
            style={styles.icon.static}
          />
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
