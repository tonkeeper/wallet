import { SheetActions, navigation } from '@tonkeeper/router';
import { renderActionModalContent } from './renderActionModalContent';
import { Icon, Modal, Steezy, Toast, TouchableOpacity, View } from '@tonkeeper/uikit';
import { tk } from '@tonkeeper/mobile/src/wallet';
import React, { memo, useCallback } from 'react';
import {
  ActionItem,
  ActionSource,
  ActionType,
  AnyActionItem,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { NotcoinTransferActionContent } from './content/NotcoinTransferActionContent';
import { NotcoinConfetti } from './components/NotcoinConfetti';
import { useIsInLocalScam, useWallet } from '../../hooks';
import { PopupMenu, PopupMenuItem } from '@tonkeeper/mobile/src/uikit';
import { t } from '../../i18n';
import { openDAppBrowser } from '@tonkeeper/mobile/src/navigation';
import { config } from '@tonkeeper/mobile/src/config';
import { openReportEncryptedCommentModal } from '../ReportEncryptedCommentModal';
import { useEncryptedCommentsStore } from '@tonkeeper/mobile/src/store';
import { shallow } from 'zustand/shallow';

type ActivityActionModalProps = {
  action: AnyActionItem;
  isNotCoin?: boolean;
};

/** Payload with possibly big content to render.
 * We should wrap content into ScrollView
 * if action has any of these fields.
 * TODO: should measure content size and conditionally wrap into ScrollView
 * */
const possiblyLargePayloadFields = ['payload', 'comment', 'encrypted_comment'];

export const ActivityActionModal = memo<ActivityActionModalProps>((props) => {
  const { action, isNotCoin } = props;
  const isInLocalScam = useIsInLocalScam(action.event.event_id);
  const wallet = useWallet();

  const decryptedComment: string | undefined = useEncryptedCommentsStore(
    (s) => s.decryptedComments[action.action_id],
    shallow,
  );
  const hasEncryptedComment = !!action.payload?.encrypted_comment;
  const hasComment = hasEncryptedComment || !!action.payload?.comment;

  const shouldWrapIntoScrollView =
    possiblyLargePayloadFields.findIndex((field) => (action as any)?.payload?.[field]) !==
    -1;

  const Content = shouldWrapIntoScrollView ? Modal.ScrollView : Modal.Content;

  const actionContent =
    isNotCoin && action.type === ActionType.JettonTransfer ? (
      <NotcoinTransferActionContent action={action} />
    ) : (
      renderActionModalContent(action, isInLocalScam)
    );

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      `${config.get('explorerUrl', wallet.isTestnet)}/transaction/${
        action.event.event_id
      }`,
    );
  }, [wallet, action.event.event_id]);

  const handleToggleSpam = useCallback(() => {
    if (isInLocalScam) {
      return wallet.localScam.remove(action.event.event_id);
    }

    if (decryptedComment) {
      return openReportEncryptedCommentModal(action.event.event_id, decryptedComment);
    }

    navigation.goBack();
    Toast.success(t('suspicious.status_update.spam.transaction'));

    wallet.localScam.add(
      action.event.event_id,
      (action.payload! as any).comment as string,
    );
  }, [decryptedComment, wallet, action.event.event_id, isInLocalScam]);

  return (
    <>
      <Modal>
        <Modal.Header
          leftContent={
            <PopupMenu
              align="flex-start"
              topOffset={48}
              width={270}
              items={[
                action.destination === 'in' &&
                  !action.event.is_scam &&
                  hasComment &&
                  (!hasEncryptedComment || decryptedComment) && (
                    <PopupMenuItem
                      waitForAnimationEnd
                      shouldCloseMenu
                      onPress={handleToggleSpam}
                      text={
                        isInLocalScam
                          ? t('suspicious.buttons.not_spam')
                          : t('suspicious.buttons.report')
                      }
                      icon={<Icon name="ic-block-16" color="accentBlue" />}
                    />
                  ),
                <PopupMenuItem
                  waitForAnimationEnd
                  shouldCloseMenu
                  onPress={handleOpenExplorer}
                  text={t('nft_actions.view_on_explorer')}
                  icon={<Icon name="ic-globe-16" color="accentBlue" />}
                />,
              ]}
            >
              <TouchableOpacity activeOpacity={0.6} style={styles.headerButton}>
                <Icon color="iconPrimary" name={'ic-ellipsis-16'} />
              </TouchableOpacity>
            </PopupMenu>
          }
        />
        <Content safeArea>{actionContent}</Content>
      </Modal>
      {isNotCoin ? <NotcoinConfetti /> : null}
    </>
  );
});

export async function openActivityActionModal(
  actionId: string,
  source: ActionSource,
  isNotCoin?: boolean,
) {
  const openModal = (action: ActionItem) => {
    navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: ActivityActionModal,
      params: { action, isNotCoin },
      path: 'TRANSACTION_DETAILS',
    });
  };

  try {
    if (source === ActionSource.Tron) {
      const item = tk.wallet.activityLoader.getTronAction(actionId);
      if (item) {
        openModal(item);
      } else {
        Toast.loading();
        const item = await tk.wallet.activityLoader.loadTronAction(actionId);
        if (item) {
          openModal(item);
        }
        Toast.hide();
      }
    } else {
      const item = tk.wallet.activityLoader.getTonAction(actionId);
      if (item) {
        openModal(item);
      } else {
        Toast.loading();
        const item = await tk.wallet.activityLoader.loadTonAction(actionId);
        if (item) {
          openModal(item);
        }
        Toast.hide();
      }
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load event');
  }
}

const styles = Steezy.create(({ colors }) => ({
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));
