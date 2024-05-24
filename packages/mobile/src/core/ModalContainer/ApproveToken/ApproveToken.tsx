import { Modal } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import React, { memo, useCallback, useMemo } from 'react';
import { Button, Icon, List, Spacer, View } from '$uikit';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { triggerImpactLight } from '$utils';
import FastImage from 'react-native-fast-image';
import { Toast } from '$store';
import Clipboard from '@react-native-community/clipboard';

import { TranslateOptions } from 'i18n-js';
import { push } from '$navigation/imperative';
import { useTokenApproval } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$wallet/managers/TokenApprovalManager';
import { Address } from '@tonkeeper/core';

export enum ImageType {
  ROUND = 'round',
  SQUARE = 'square',
}

export enum ApprovalVerification {
  WHITELIST = 'whitelist',
  NONE = 'none',
  BLACKLIST = 'blacklist',
}

export interface ApproveTokenModalParams {
  tokenIdentifier: string;
  type: TokenApprovalType;
  verification?: ApprovalVerification;
  imageType?: ImageType;
  name?: string;
  image?: string;
}
export const ApproveToken = memo((props: ApproveTokenModalParams) => {
  const nav = useNavigation();
  const currentStatus = useTokenApproval((state) => {
    return state.tokens[props.tokenIdentifier];
  });

  const handleUpdateStatus = useCallback(
    (approvalStatus: TokenApprovalStatus) => () => {
      tk.wallet.tokenApproval.updateTokenStatus(
        props.tokenIdentifier,
        approvalStatus,
        props.type,
      );
      nav.goBack();
    },
    [nav, props.tokenIdentifier, props.type],
  );

  const handleCopyAddress = useCallback(() => {
    Clipboard.setString(props.tokenIdentifier);
    triggerImpactLight();
    Toast.show(t('approval.token_copied'));
  }, [props.tokenIdentifier]);

  const modalState = useMemo(() => {
    if (
      props.verification === ApprovalVerification.BLACKLIST ||
      [TokenApprovalStatus.Spam, TokenApprovalStatus.Declined].includes(
        currentStatus?.current,
      )
    ) {
      return 'declined';
    } else if (
      props.verification === ApprovalVerification.WHITELIST ||
      currentStatus?.current === TokenApprovalStatus.Approved
    ) {
      return 'approved';
    }
    return 'approved';
  }, [currentStatus, props.verification]);

  const translationPrefix = useMemo(() => {
    switch (props.type) {
      case TokenApprovalType.Token:
        return 'token';
      case TokenApprovalType.Collection:
        return 'collection';
      case TokenApprovalType.Inscription:
        return 'token';
    }
  }, [props.type]);

  const translateWithPrefix = useCallback(
    (key: string, options?: TranslateOptions) =>
      t(`approval.${key}_${translationPrefix}`, options),
    [translationPrefix],
  );

  const renderActions = useCallback(() => {
    switch (modalState) {
      case 'approved':
        return (
          <Button
            onPress={handleUpdateStatus(TokenApprovalStatus.Declined)}
            mode="secondary"
          >
            {translateWithPrefix('move_to_declined')}
          </Button>
        );
      case 'declined':
        return (
          <Button
            onPress={handleUpdateStatus(TokenApprovalStatus.Approved)}
            mode="secondary"
          >
            {currentStatus?.current === TokenApprovalStatus.Spam
              ? t('approval.not_spam')
              : translateWithPrefix('move_to_accepted')}
          </Button>
        );
    }
  }, [currentStatus, handleUpdateStatus, modalState, translateWithPrefix]);

  return (
    <Modal>
      <Modal.Header title={translateWithPrefix('details')} />
      <Modal.Content>
        <View style={styles.wrap}>
          <List indent={false} compact={false}>
            {props.name ? (
              <List.Item
                title={t('approval.name')}
                subtitle={props.name}
                value={
                  <FastImage
                    style={
                      props.imageType !== ImageType.SQUARE
                        ? styles.round.static
                        : styles.square.static
                    }
                    source={{ uri: props.image }}
                  />
                }
              />
            ) : null}
            <List.Item
              onPress={handleCopyAddress}
              title={translateWithPrefix('id')}
              subtitle={
                props.type === TokenApprovalType.Inscription
                  ? props.tokenIdentifier
                  : Address.parse(props.tokenIdentifier).toShort(6)
              }
              value={
                <View style={styles.copyIconContainer}>
                  <Icon name={'ic-copy-16'} />
                </View>
              }
            />
          </List>
        </View>
        <Spacer y={16} />
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerWrap}>{renderActions()}</View>
        <Spacer y={16} />
      </Modal.Footer>
    </Modal>
  );
});

export const openApproveTokenModal = async (params: ApproveTokenModalParams) => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ApproveToken,
    path: 'ApproveToken',
    params,
  });

  return true;
};

const styles = Steezy.create({
  wrap: {
    paddingHorizontal: 16,
  },
  textWrap: {
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  footerWrap: {
    paddingHorizontal: 16,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  copyIconContainer: {
    margin: 4,
  },
});
