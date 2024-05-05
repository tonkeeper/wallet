import { memo, useCallback, useState } from 'react';
import {
  Button,
  Icon,
  Modal,
  Spacer,
  Text,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { Steezy } from '@tonkeeper/uikit';
import { useEncryptedCommentsStore } from '@tonkeeper/mobile/src/store';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { CheckboxView } from '@tonkeeper/mobile/src/uikit/Checkbox/Checkbox';
import { t } from '@tonkeeper/shared/i18n';

export interface EncryptedCommentModalProps {
  callback: () => void;
}

export const EncryptedCommentModal = memo<EncryptedCommentModalProps>((props) => {
  const nav = useNavigation();
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const setShouldOpenEncryptedCommentModal = useEncryptedCommentsStore(
    (state) => state.actions.setShouldOpenEncryptedCommentModal,
  );
  const handleSwitchCheckbox = useCallback(() => {
    setDoNotShowAgain(!doNotShowAgain);
  }, [setDoNotShowAgain, doNotShowAgain]);

  const handleDecryptComment = useCallback(async () => {
    if (doNotShowAgain) {
      setShouldOpenEncryptedCommentModal(false);
    }
    await props.callback();
    nav.goBack();
  }, [nav, doNotShowAgain]);

  return (
    <Modal alternateBackground>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.wrap}>
          <Icon color={'accentGreen'} name={'ic-lock-128'} />
          <Spacer y={16} />
          <Text textAlign="center" type="h2">
            {t('encryptedComments.encryptedCommentModal.title')}
          </Text>
          <Spacer y={4} />
          <Text textAlign="center" color="textSecondary" type="body1">
            {t('encryptedComments.encryptedCommentModal.description')}
          </Text>
        </View>
        <Spacer y={16} />
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleDecryptComment}
            size="large"
            title={t('encryptedComments.encryptedCommentModal.button')}
            color="secondary"
          />
          <Spacer y={16} />
          <TouchableOpacity
            onPress={handleSwitchCheckbox}
            style={styles.checkboxWithLabel}
          >
            <CheckboxView checked={doNotShowAgain} />
            <Spacer x={8} />
            <Text type="body1" color="textSecondary">
              {t('encryptedComments.encryptedCommentModal.checkboxLabel')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal.Content>
      <Modal.Footer alternateBackground>
        <Spacer y={16} />
      </Modal.Footer>
    </Modal>
  );
});

export function openEncryptedCommentModalIfNeeded(callback: () => Promise<void>) {
  if (useEncryptedCommentsStore.getState().shouldOpenEncryptedCommentModal) {
    return navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: EncryptedCommentModal,
      params: { callback },
      path: 'EncryptedMessageModal',
    });
  } else {
    return callback();
  }
}

const styles = Steezy.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    textAlign: 'center',
    paddingTop: 48,
  },
  footerWrap: {
    paddingHorizontal: 16,
  },
  checkboxWithLabel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
});
