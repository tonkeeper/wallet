import React, { memo, useCallback } from 'react';
import { Icon, List, Steezy, SText as Text, View } from '@tonkeeper/uikit';
import { SpoilerView } from '@tonkeeper/mobile/src/uikit';
import { Toast, useEncryptedCommentsStore } from '@tonkeeper/mobile/src/store';
import { shallow } from 'zustand/shallow';
import { TransactionDetails } from '../../mappers/AccountEventsMapper';
import { decryptMessageComment } from '@tonkeeper/core';
import { t } from '../../i18n';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '@tonkeeper/mobile/src/store/wallet';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { TouchableWithoutFeedback } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Animated from 'react-native-reanimated';
import { Account } from '@tonkeeper/core/src/TonAPI';

export enum EncryptedCommentLayout {
  LIST_ITEM,
  BUBBLE,
}

export interface EncryptedCommentProps {
  transactionId: TransactionDetails['id'];
  transactionType: TransactionDetails['type'] | 'SimplePreview';
  encryptedComment: TransactionDetails['encryptedComment'];
  sender: Account;
  layout: EncryptedCommentLayout;
  backgroundStyle?: { backgroundColor: string };
}

const EncryptedCommentComponent: React.FC<EncryptedCommentProps> = (props) => {
  const actionKey = props.transactionId + props.transactionType;
  const decryptedComment: string | undefined = useEncryptedCommentsStore(
    (s) => s.decryptedComments[actionKey],
    shallow,
  );

  const wallet = useSelector(walletWalletSelector);
  const unlockVault = useUnlockVault();

  const saveDecryptedComment = useEncryptedCommentsStore(
    (s) => s.actions.saveDecryptedComment,
  );

  const encryptedCommentLength = props.encryptedComment
    ? props.encryptedComment.cipher_text.length / 2 - 64
    : 0;

  const decryptComment = useCallback(
    async (
      actionKey: string,
      encryptedComment?: EncryptedCommentProps['encryptedComment'],
      senderAddress?: string,
    ) => {
      if (!encryptedComment || !senderAddress) {
        return;
      }

      try {
        const vault = await unlockVault();
        const privateKey = await vault.getTonPrivateKey();

        const comment = await decryptMessageComment(
          Buffer.from(encryptedComment.cipher_text, 'hex'),
          wallet!.vault.tonPublicKey,
          privateKey,
          senderAddress,
        );

        saveDecryptedComment(actionKey, comment);
      } catch (e) {
        Toast.fail(t('decryption_error'));
      }
    },
    [saveDecryptedComment, t, unlockVault, wallet],
  );

  // TODO: replace on useCopyText
  const copyText = useCallback(
    (value: string) => () => {
      Clipboard.setString(value);
      // Toast.success(t('copied')); // TODO: Move toast to shared
    },
    [],
  );

  const handleDecryptComment = useCallback(() => {
    decryptComment(actionKey, props.encryptedComment, props.sender.address);
  }, [decryptComment]);

  const encryptedCommentMock = 's'.repeat(encryptedCommentLength);

  // Feature not ready yet
  return null;

  if (props.layout === EncryptedCommentLayout.LIST_ITEM) {
    return (
      <List.Item
        label={
          <View style={styles.encryptedCommentContainer}>
            <Text style={styles.labelText.static} color="textSecondary" type="body1">
              {t('transactionDetails.comment')}
            </Text>
            <View style={styles.encryptedCommentIconContainer}>
              <Icon name="ic-lock-16" color="accentGreen" />
            </View>
          </View>
        }
        value={
          <View style={styles.listItemSpoilerView}>
            <SpoilerView isOn={!decryptedComment}>
              <TouchableWithoutFeedback
                onPress={
                  decryptedComment ? copyText(decryptedComment) : handleDecryptComment
                }
              >
                <Text type="label1">{decryptedComment || encryptedCommentMock}</Text>
              </TouchableWithoutFeedback>
            </SpoilerView>
          </View>
        }
      />
    );
  } else {
    return (
      <TouchableWithoutFeedback
        disabled={!!decryptedComment}
        onPress={handleDecryptComment}
      >
        <Animated.View style={[styles.bubble.static, props.backgroundStyle]}>
          <SpoilerView isOn={!decryptedComment}>
            <Text type="body2">{decryptedComment || encryptedCommentMock}</Text>
          </SpoilerView>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
};

export const EncryptedComment = memo(EncryptedCommentComponent);

const styles = Steezy.create({
  encryptedCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptedCommentIconContainer: {
    marginLeft: 4,
  },
  labelText: {
    flexShrink: 1,
  },
  bubble: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    paddingTop: 7.5,
    paddingBottom: 8.5,
  },
  listItemSpoilerView: {
    maxWidth: 200
  }
});
