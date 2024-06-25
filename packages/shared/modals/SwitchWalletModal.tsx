import { useNavigation } from '@tonkeeper/router';
import {
  Button,
  Flash,
  Haptics,
  Icon,
  List,
  Modal,
  Steezy,
  View,
  deviceHeight,
} from '@tonkeeper/uikit';
import { FC, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useWalletCurrency, useWallets } from '../hooks';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { t } from '../i18n';
import { formatter } from '../formatter';
import { WalletListItem } from '../components';
import { HideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';
import { StatusBar } from 'react-native';
import { SheetModalScrollViewRef } from '@tonkeeper/uikit/src/containers/Modal/SheetModal/SheetModalScrollView';

interface Props {
  withW5Flash?: boolean;
  selected?: string;
  onSelect?: (identifier: string) => void;
}

export const SwitchWalletModal: FC<Props> = memo((props) => {
  const nav = useNavigation();
  const selectedIdentifier = props.selected ?? tk.wallet.identifier;
  const allWallets = useWallets();
  const selectableWallets = useMemo(
    () =>
      props.onSelect
        ? allWallets.filter((wallet) => !wallet.isWatchOnly && !wallet.isExternal)
        : allWallets,
    [allWallets, props.onSelect],
  );
  const currency = useWalletCurrency();

  const scrollViewRef = useRef<SheetModalScrollViewRef>(null);

  const handlePress = useCallback(
    (identifier: string) => () => {
      if (props.onSelect) {
        Haptics.selection();
        props.onSelect(identifier);
      } else {
        tk.switchWallet(identifier);
      }
      nav.goBack();
    },
    [],
  );

  const delay =
    deviceHeight - (StatusBar.currentHeight ?? 0) < selectableWallets.length * 76
      ? 1400
      : 600;

  useEffect(() => {
    if (!props.withW5Flash) {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 800);
  }, []);

  return (
    <Modal>
      <Modal.Header title={t('wallets')} />
      <Modal.ScrollView ref={scrollViewRef}>
        <Modal.Content safeArea>
          <List>
            {selectableWallets.map((wallet, index) => (
              <Flash
                disabled={
                  !wallet.isW5 ||
                  index + 1 < selectableWallets.length ||
                  !props.withW5Flash
                }
                delay={delay}
                key={wallet.identifier}
              >
                <WalletListItem
                  key={wallet.identifier}
                  wallet={wallet}
                  onPress={handlePress(wallet.identifier)}
                  subtitle={
                    <HideableAmount variant="body2" color="textSecondary">
                      {formatter.format(wallet.totalFiat, { currency })}
                    </HideableAmount>
                  }
                  rightContent={
                    selectedIdentifier === wallet.identifier && (
                      <View style={styles.checkmark}>
                        <Icon
                          style={styles.checkmarkIcon.static}
                          name="ic-donemark-thin-28"
                          color="accentBlue"
                        />
                      </View>
                    )
                  }
                />
              </Flash>
            ))}
          </List>
          <View style={styles.buttons}>
            <Button
              // navigate="/add-wallet"
              onPress={() => {
                nav.replaceModal('/add-wallet');
              }}
              color="secondary"
              title={t('add_wallet')}
              size="small"
            />
            {/* {wallets.length > 1 && (
            <Button
              style={styles.editButton.static}
              navigate="/edit-wallets"
              size="small"
              color="secondary"
              title="Edit"
            />
          )} */}
          </View>
        </Modal.Content>
      </Modal.ScrollView>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    marginLeft: 12,
  },
  checkmark: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  checkmarkIcon: {
    position: 'absolute',
    right: 0,
    bottom: -2,
  },
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
