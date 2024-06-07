import {
  Button,
  Modal,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  WalletIcon,
} from '@tonkeeper/uikit';
import React, { FC, memo, useCallback, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Checkbox } from '$uikit';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';
import { trackEvent } from '$utils/stats';
import { openDeleteAccountDone } from '$navigation';
import { InteractionManager } from 'react-native';
import { tk } from '$wallet';

const BUTTON_HIT_SLOP = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};

interface Props {
  isDelete?: boolean;
}

export const LogoutWarningModal: FC<Props> = memo((props) => {
  const { isDelete } = props;

  const nav = useNavigation();
  const dispatch = useDispatch();

  const [checked, setChecked] = useState(false);

  const handleContinue = useCallback(() => {
    nav.closeModal?.();

    if (isDelete) {
      trackEvent('delete_wallet');
      InteractionManager.runAfterInteractions(() => {
        openDeleteAccountDone();
      });
    } else {
      InteractionManager.runAfterInteractions(() => {
        dispatch(walletActions.cleanWallet());
      });
    }
  }, [dispatch, isDelete, nav]);

  const handleBackup = useCallback(() => {
    nav.replaceModal('/backup-warning');
  }, [nav]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <Text style={styles.spacing.static} type="h2" textAlign="center">
            {isDelete ? t('logout_modal.delete_title') : t('logout_modal.title')}
          </Text>
          <Spacer y={4} />
          <Text
            style={styles.spacing.static}
            type="body1"
            color="textSecondary"
            textAlign="center"
          >
            {isDelete ? t('logout_modal.delete_caption') : t('logout_modal.caption')}
          </Text>
          <View style={styles.content}>
            <Checkbox checked={checked} onChange={() => setChecked((s) => !s)} />
            <Spacer x={12} />
            <View style={styles.agreementContainer}>
              <TouchableOpacity onPress={() => setChecked((s) => !s)}>
                <Text>
                  <Text>{t('logout_modal.agreement')}</Text>{' '}
                  <WalletIcon
                    emojiStyle={styles.emoji.static}
                    size={16}
                    value={tk.wallet.config.emoji}
                  />{' '}
                  <Text>{tk.wallet.config.name}</Text>
                </Text>
              </TouchableOpacity>
              <Spacer y={8} />
              <TouchableOpacity hitSlop={BUTTON_HIT_SLOP} onPress={handleBackup}>
                <Text type="label1" color="textAccent">
                  {t('logout_modal.backup_button')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Button
            title={
              isDelete ? t('logout_modal.delete_button') : t('logout_modal.logout_button')
            }
            color="secondary"
            disabled={!checked}
            onPress={handleContinue}
          />
          <Spacer y={16} />
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    marginHorizontal: 16,
    marginTop: 48,
  },
  content: {
    marginTop: 32,
    marginVertical: 32,
    backgroundColor: colors.backgroundContent,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  agreementContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  spacing: {
    paddingHorizontal: 16,
  },
  dot: {
    backgroundColor: colors.textPrimary,
    width: 2.8,
    height: 2.8,
    borderRadius: 2.8 / 2,
    marginTop: 9.8,
    marginRight: 9.5,
  },
  agreementWithTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 16,
  },
}));
