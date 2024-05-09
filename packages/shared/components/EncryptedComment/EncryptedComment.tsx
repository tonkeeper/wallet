import React, { memo, useCallback } from 'react';
import { Icon, isAndroid, List, Steezy, SText as Text, View } from '@tonkeeper/uikit';
import { SpoilerView } from '@tonkeeper/mobile/src/uikit';
import { Toast, useEncryptedCommentsStore } from '@tonkeeper/mobile/src/store';
import { shallow } from 'zustand/shallow';
import { decryptMessageComment } from '@tonkeeper/core';
import { t } from '../../i18n';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '@tonkeeper/mobile/src/store/wallet';
import { useUnlockVault } from '@tonkeeper/mobile/src/core/ModalContainer/NFTOperations/useUnlockVault';
import { TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  AccountAddress,
  EncryptedComment as IEncryptedComment,
} from '@tonkeeper/core/src/TonAPI';
import { SpoilerViewMock } from './components/SpoilerViewMock';
import { useCopyText } from '@tonkeeper/mobile/src/hooks/useCopyText';
import { openEncryptedCommentModalIfNeeded } from '../../modals/EncryptedCommentModal';
import { tk } from '@tonkeeper/mobile/src/wallet';

export enum EncryptedCommentLayout {
  LIST_ITEM,
  BUBBLE,
}

export interface EncryptedCommentProps {
  actionId: string;
  encryptedComment: IEncryptedComment;
  sender: AccountAddress;
  layout: EncryptedCommentLayout;
  backgroundStyle?: { backgroundColor: string };
}

const SpoilerViewComponent = isAndroid ? SpoilerViewMock : SpoilerView;

const EncryptedCommentComponent: React.FC<EncryptedCommentProps> = (props) => {
  const decryptedComment: string | undefined = useEncryptedCommentsStore(
    (s) => s.decryptedComments[props.actionId],
    shallow,
  );

  const wallet = useSelector(walletWalletSelector);
  const unlockVault = useUnlockVault();
  const copyText = useCopyText();

  const handleCopyComment = useCallback(
    () => copyText(decryptedComment),
    [decryptedComment],
  );

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

  const handleDecryptComment = useCallback(() => {
    if (tk.wallet.isWatchOnly || tk.wallet.isExternal) {
      return;
    }
    openEncryptedCommentModalIfNeeded(() =>
      decryptComment(props.actionId, props.encryptedComment, props.sender.address),
    );
  }, [decryptComment]);

  const encryptedCommentMock = 's'.repeat(encryptedCommentLength);

  if (props.layout === EncryptedCommentLayout.LIST_ITEM) {
    return (
      <List.Item
        onPress={decryptedComment ? handleCopyComment : handleDecryptComment}
        title={
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
            <SpoilerViewComponent
              mockText={t('encryptedComments.show')}
              mockTextType="label1"
              isOn={!decryptedComment}
            >
              <Text type="label1">{decryptedComment || encryptedCommentMock}</Text>
            </SpoilerViewComponent>
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
          <SpoilerViewComponent withIcon isOn={!decryptedComment}>
            <Text type="body2">{decryptedComment || encryptedCommentMock}</Text>
          </SpoilerViewComponent>
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
    maxWidth: 200,
  },
});
