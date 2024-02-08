import { Modal } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import React, { memo, useCallback, useMemo } from 'react';
import { JettonVerification } from '$store/models';
import { Button, Icon, Spacer, View, List } from '$uikit';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { triggerImpactLight } from '$utils';
import FastImage from 'react-native-fast-image';
import { Toast } from '$store';
import Clipboard from '@react-native-community/clipboard';

import { TranslateOptions } from 'i18n-js';
import { push } from '$navigation/imperative';
import { Address } from '@tonkeeper/core';
import { useTokenApproval } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import {
  TokenApprovalType,
  TokenApprovalStatus,
} from '$wallet/managers/TokenApprovalManager';

export enum ImageType {
  ROUND = 'round',
  SQUARE = 'square',
}
export interface ApproveTokenModalParams {
  tokenAddress: string;
  type: TokenApprovalType;
  verification?: JettonVerification;
  imageType?: ImageType;
  name?: string;
  image?: string;
}
export const ApproveToken = memo((props: ApproveTokenModalParams) => {
  const nav = useNavigation();
  const currentStatus = useTokenApproval((state) => {
    const rawAddress = Address.parse(props.tokenAddress).toRaw();
    return state.tokens[rawAddress];
  });

  const handleUpdateStatus = useCallback(
    (approvalStatus: TokenApprovalStatus) => () => {
      tk.wallet.tokenApproval.updateTokenStatus(
        props.tokenAddress,
        approvalStatus,
        props.type,
      );
      nav.goBack();
    },
    [nav, props.tokenAddress, props.type],
  );

  const handleCopyAddress = useCallback(() => {
    Clipboard.setString(props.tokenAddress);
    triggerImpactLight();
    Toast.show(t('approval.token_copied'));
  }, [props.tokenAddress]);

  const modalState = useMemo(() => {
    if (
      props.verification === JettonVerification.BLACKLIST ||
      currentStatus?.current === TokenApprovalStatus.Declined
    ) {
      return 'declined';
    } else if (
      props.verification === JettonVerification.WHITELIST ||
      currentStatus?.current === TokenApprovalStatus.Approved
    ) {
      return 'approved';
    }
    return 'approved';
  }, [currentStatus, props.verification]);

  const translationPrefix = useMemo(() => {
    if (props.type === TokenApprovalType.Token) {
      return 'token';
    } else {
      return 'collection';
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
            {translateWithPrefix('move_to_accepted')}
          </Button>
        );
    }
  }, [handleUpdateStatus, modalState, translateWithPrefix]);

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
              subtitle={Address.parse(props.tokenAddress).toShort(6)}
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
